interface Community {
    id: string;
    name: string;
    // Add other community properties as needed
}

interface FetchData {
    _embedded: {
        communities: Community[];
    };
    _links: {
        next?: {
            href: string;
        };
    };
    page: {
        totalElements: number;
    };
}

interface FetchAllCommunitiesResult {
    communities: Community[];
    loading: boolean;
    error: Error | null;
    count: number;
}

const getCommunitiesList = async (
    DSPACE_BASE_URL: string,
    fetchWithCache: (url: string) => Promise<FetchData>
): Promise<FetchAllCommunitiesResult> => {
    let allCommunities: Community[] = [];
    let loading = true;
    let error: Error | null = null;
    let count = 0;

    try {
        let url = `${DSPACE_BASE_URL}/core/communities`;
        let hasNext = true;

        while (hasNext) {
            const data = await fetchWithCache(url);
            allCommunities = allCommunities.concat(data._embedded.communities);
            count = data.page.totalElements;
            if (data._links.next) {
                url = data._links.next.href;
            } else {
                hasNext = false;
            }
        }
    } catch (err) {
        error = err as Error;
    } finally {
        loading = false;
    }

    return { communities: allCommunities, loading, error, count };
};

export default getCommunitiesList;
