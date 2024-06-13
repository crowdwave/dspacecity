from starlette.applications import Starlette
from starlette.responses import Response
from starlette.routing import Route
from urllib.parse import urlparse, parse_qs
import httpx

async def proxy_request(request):
    # Parse the target URL from query parameters
    query_params = parse_qs(request.url.query)
    target = query_params.get('target')

    if not target:
        return Response(content='Bad Request', status_code=400)

    target_url = target[0]
    parsed_url = urlparse(target_url)
    print(f'Target URL: {target_url}')
    print(f'Method: {request.method}, URL: {target_url}')

    # Fake headers to make the request appear as if it's coming from Chrome on macOS
    fake_headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

    # Prepare the request for the target server
    async with httpx.AsyncClient() as client:
        try:
            if request.method in ['POST', 'PUT']:
                body = await request.body()
                response = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=fake_headers,
                    content=body
                )
            else:
                response = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=fake_headers
                )

            print(f'Proxy Response for {target_url} - Status: {response.status_code}')
            print('Raw Response:', response.text)

            # Set CORS headers in the response
            cors_headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': '*',
            }

            headers = dict(response.headers)
            headers.update(cors_headers)

            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=headers
            )

        except httpx.RequestError as exc:
            print(f'An error occurred while requesting {exc.request.url!r}.')
            return Response(content='Bad Gateway', status_code=502)

routes = [
    Route("/{path:path}", proxy_request, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
]

app = Starlette(routes=routes)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8080)
