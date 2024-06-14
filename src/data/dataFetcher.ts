// DSpace API Service
export const DSPACE_BASE_URL = 'https://api.drum.lib.umd.edu/server/api';

// Fetch function with Cache API integration
export const fetchWithCache = async (url: string) => {
    const cacheName = 'dspace-api-cache';
    const cache = await caches.open(cacheName);
    const cachedResponse: Response | undefined = await cache.match(url);

    if (cachedResponse) {
        return cachedResponse.json();
    }

    const proxiedUrl = `https://api.dspacecity.com?target=${url}`;
    const response = await fetch(proxiedUrl, {
        headers: {
            'Content-Type': 'application/json',
            // Include any necessary authentication headers here
        },
    });

    if (response.ok) {
        cache.put(url, response.clone());
        return response.json();
    } else {
        throw new Error('Network response was not ok');
    }
};


