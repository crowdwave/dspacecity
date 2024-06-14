from starlette.applications import Starlette
from starlette.responses import Response, FileResponse
from starlette.routing import Route
from urllib.parse import urlparse, parse_qs
import httpx
import os
import hashlib
import aiofiles
import re
import logging
from datetime import datetime, timedelta
from collections import deque
import asyncio
import argparse

# Version information
VERSION = "1.0.0"

# Directory to store the cached responses and logs
CACHE_DIR = 'cache'
LOG_DIR = '/var/log/apache2/'
LOG_FILE = os.path.join(LOG_DIR, 'proxy.log')

# Throttling configuration
THROTTLE_LIMIT = 50  # max requests
THROTTLE_PERIOD = timedelta(seconds=5)  # time window
THROTTLE_WAIT_TIME = 3  # wait time between retries in seconds
THROTTLE_MAX_RETRIES = 2  # maximum number of retries
request_times = deque(maxlen=THROTTLE_LIMIT)

# Whitelist of allowed hostnames
WHITELIST = ["api.drum.lib.umd.edu"]


def check_directory(directory, dir_description):
    if not os.path.exists(directory):
        print(f"{dir_description} does not exist.")
        print(f"To create it and set the correct permissions, run the following commands:")
        print(f"sudo mkdir -p {directory}")
        print(f"sudo chown -R $USER:$USER {directory}")
        print(f"sudo chmod -R 755 {directory}")
        exit(1)
    if not os.access(directory, os.W_OK):
        print(f"{dir_description} is not writable.")
        print(f"To set the correct permissions, run the following commands:")
        print(f"sudo chown -R $USER:$USER {directory}")
        print(f"sudo chmod -R 755 {directory}")
        exit(1)


# Ensure the cache and log directories exist and are writable
check_directory(CACHE_DIR, "Cache directory")
check_directory(LOG_DIR, "Log directory")

# Configure logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(message)s'
)


def sanitize_header_value(value):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', value)


def url_to_filename(url, etag='', last_modified=''):
    url_hash = hashlib.sha256(url.encode()).hexdigest()

    # Ensure ETag and Last-Modified are prefixed with their names or "headernotpresent"
    etag_prefix = f'ETag_{sanitize_header_value(etag)}' if etag else 'ETag_headernotpresent'
    last_modified_prefix = f'Last-Modified_{sanitize_header_value(last_modified.replace(" ", "_"))}' if last_modified else 'Last-Modified_headernotpresent'

    filename = os.path.join(CACHE_DIR, f'{url_hash}__{etag_prefix}__{last_modified_prefix}__.cache')
    return filename


def is_valid_url(url):
    parsed_url = urlparse(url)
    return parsed_url.scheme in ["http", "https"] and parsed_url.hostname in WHITELIST


def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response


def log_request_info(request, response_status, cache_status, proxy_outcome, target_hostname):
    safe_headers = {k: v for k, v in request.headers.items() if k.lower() not in ['authorization', 'cookie']}
    log_entry = {
        "client_ip": request.client.host,
        "timestamp": datetime.utcnow().strftime('%d/%b/%Y:%H:%M:%S %z'),
        "method": request.method,
        "url": str(request.url),
        "protocol": request.scope.get('type', ''),
        "status": response_status,
        "content_length": "-",
        "referrer": request.headers.get("referer", "-"),
        "user_agent": request.headers.get("user-agent", "-"),
        "cache_status": cache_status,
        "proxy_outcome": proxy_outcome,
        "target_hostname": target_hostname
    }
    log_message = '{client_ip} - [{timestamp}] "{method} {url} {protocol}" {status} {content_length} "{referrer}" "{user_agent}" "{cache_status}" "{proxy_outcome}" "{target_hostname}"'.format(
        **log_entry)
    logging.info(log_message)


def clean_headers(headers):
    return {k: v for k, v in headers.items() if v is not None}


async def proxy_request(request):
    if request.method == "OPTIONS":
        cors_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': '*',
        }
        return Response(content='', status_code=200, headers=cors_headers)

    query_params = parse_qs(request.url.query)
    target = query_params.get('target')

    if not target or not is_valid_url(target[0]):
        log_request_info(request, 400, "N/A", "Bad Request", "N/A")
        return Response(content='Bad Request', status_code=400)

    target_url = target[0]
    parsed_url = urlparse(target_url)

    if parsed_url.hostname not in WHITELIST:
        log_request_info(request, 403, "N/A", "Forbidden", parsed_url.hostname)
        return Response(content='Forbidden', status_code=403)

    url_hash = hashlib.sha256(target_url.encode()).hexdigest()
    matching_files = [f for f in os.listdir(CACHE_DIR) if f.startswith(url_hash)]
    print(matching_files)

    content_type = request.headers.get("Content-Type") or "application/octet-stream"

    for filename in matching_files:
        _, etag, last_modified,*_ = filename.split('__')
        file_path = os.path.join(CACHE_DIR, filename)

        print(f'etag: {etag}')
        print(f'last_modified: {last_modified}')
        etag_in_filename = etag != 'ETag_headernotpresent'
        print(f'etag_in_filename: {etag_in_filename}')
        last_modified_in_filename = last_modified != 'Last-Modified_headernotpresent'
        print(f'last_modified_in_filename: {last_modified_in_filename}')
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': '*',
            "Content-Type": content_type,
        }

        async def return_cached_file(file_path):
            print(f"Returning cached file: {file_path}")
            try:
                log_request_info(request, 304, "CACHEHIT", "Not Modified", parsed_url.hostname)
                print('foo')
                return FileResponse(file_path, headers=headers)
            except FileNotFoundError:
                return Response(content="File not found", status_code=404)
            except Exception as e:
                return Response(content=f"unknown error: {str(e)}", status_code=400)

        if not etag_in_filename or not last_modified_in_filename:
            print("not etag_in_filename or not last_modified_in_filename")
            response =  await return_cached_file(file_path)
            print(response)
            return response

        if etag_in_filename and last_modified_in_filename:
            headers = clean_headers({
                'If-None-Match': etag if etag_in_filename else None,
                'If-Modified-Since': last_modified.replace('_', ' ') if last_modified_in_filename else None
            })

            async with httpx.AsyncClient() as client:
                try:
                    head_response = await client.head(target_url, headers=headers)
                    if head_response.status_code == 304:
                        print("304 said unmodified, so return cached")
                        return await return_cached_file(file_path)
                except httpx.RequestError as exc:
                    pass

    # request from upstream and send to client
    fake_headers = clean_headers({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    })

    now = datetime.utcnow()

    for _ in range(THROTTLE_MAX_RETRIES + 1):
        while len(request_times) >= THROTTLE_LIMIT and now - request_times[0] < THROTTLE_PERIOD:
            await asyncio.sleep(THROTTLE_WAIT_TIME)
            now = datetime.utcnow()

        if len(request_times) < THROTTLE_LIMIT or now - request_times[0] >= THROTTLE_PERIOD:
            request_times.append(now)
            break
    else:
        log_request_info(request, 429, "N/A", "Too Many Requests", parsed_url.hostname)
        return Response(content='Too Many Requests', status_code=429)

    try:
        client = httpx.AsyncClient()
        req = client.build_request(
            request.method,
            target_url, headers=fake_headers,
            data=(await request.body() if request.method in ['POST', 'PUT'] else None)
        )
        response = await client.send(req)
        etag = response.headers.get('ETag', 'headernotpresent')
        last_modified = response.headers.get('Last-Modified', 'headernotpresent')
        cache_filename = url_to_filename(target_url, etag, last_modified)
        response_content = response.content
        if request.method != 'HEAD':
            async with aiofiles.open(cache_filename, 'wb') as cache_file:
                await cache_file.write(response_content)
        cors_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': '*',
        }
        headers = dict(response.headers)
        headers.update(cors_headers)

        response = Response(
            content=response_content if request.method != 'HEAD' else b'',
            status_code=response.status_code,
            headers=headers
        )

        log_request_info(request, response.status_code, "CACHEMISS", "Fetched from target", parsed_url.hostname)
        return set_security_headers(response)

    except httpx.RequestError as exc:
        print(repr(exc))
        log_request_info(request, 503, "ERROR", f'503 service unavailable: {exc}', parsed_url.hostname)
        response = Response(content='service unavailable', status_code=503, headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': '*'
        })
        return set_security_headers(response)


routes = [
    Route("/{path:path}", proxy_request, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
]

app = Starlette(routes=routes)


def print_help():
    help_text = """
        Usage: python main.py [options]

        Options:
          -h, --help         Show this help message and exit
          -v, --version      Show the version of the program

        Description:
          This program acts as an HTTP proxy server that validates, caches, and logs requests. 
          It enforces a whitelist for target URLs, implements request throttling,
          and sets security headers to mitigate common web vulnerabilities.
        """
    print(help_text)


def print_version():
    print(f"Version: {VERSION}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('-v', '--version', action='store_true', help='Show the version of the program')
    parser.add_argument('-h', '--help', action='store_true', help='Show this help message and exit')
    args = parser.parse_args()

    if args.version:
        print_version()
        exit(0)
    if args.help:
        print_help()
        exit(0)

    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=8080)
