import {fetchWithCache} from "./dataFetcher";

interface Community {
    id: string;
    name: string;
    handle: string;
    archivedItemsCount: number;
    _links: {
        subcommunities?: { href: string };
        collections?: { href: string };
    };
    // Add other community properties as needed
}

interface SubCommunity {
    id: string;
    name: string;
    // Add other subcommunity properties as needed
}

interface Collection {
    id: string;
    name: string;
    // Add other collection properties as needed
}

interface FetchData<T> {
    _embedded: {
        [key: string]: T[];
    };
}

const getCommunityDetails = async (
    community: Community,
): Promise<{
    subCommunities: SubCommunity[];
    collections: Collection[];
    error: Error | null;
}> => {
    let subCommunities: SubCommunity[] = [];
    let collections: Collection[] = [];
    let error: Error | null = null;

    try {
        const subCommunityLinks = community._links.subcommunities?.href;
        const collectionLinks = community._links.collections?.href;

        if (subCommunityLinks) {
            const subCommunityData: FetchData<SubCommunity> = await fetchWithCache(subCommunityLinks);
            subCommunities = subCommunityData._embedded.subcommunities;
        }

        if (collectionLinks) {
            const collectionData: FetchData<Collection> = await fetchWithCache(collectionLinks);
            collections = collectionData._embedded.collections;
        }
    } catch (err) {
        error = err as Error;
    }

    return { subCommunities, collections, error };
};

export default getCommunityDetails;
