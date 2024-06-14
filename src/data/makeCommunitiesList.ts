import { DSPACE_BASE_URL, fetchWithCache } from "./dataFetcher";
import { ListMetaDataItem } from "../listnavigator/listNavigatorTypes";

// Define interfaces for metadata and links
interface Metadata {
    value: string;
    language: null | string;
    authority: null | string;
    confidence: number;
    place: number;
}

interface Links {
    collections: {
        href: string;
    };
    logo: {
        href: string;
    };
    subcommunities: {
        href: string;
    };
    parentCommunity: {
        href: string;
    };
    communityGroup: {
        href: string;
    };
    adminGroup: {
        href: string;
    };
    self: {
        href: string;
    };
}

interface Community {
    id: string;
    uuid: string;
    name: string;
    handle: string;
    metadata: {
        "dc.description"?: Metadata[];
        "dc.description.abstract"?: Metadata[];
        "dc.identifier.uri": Metadata[];
        "dc.title": Metadata[];
    };
    archivedItemsCount: number;
    type: string;
    _links: Links;
}

interface Self {
    href: string;
}

interface Search {
    href: string;
}

interface Next {
    href: string;
}

interface Links2 {
    self: Self;
    search: Search;
    next?: Next; // The '?' makes it an optional property
}

interface Page {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
}

export interface RootObject {
    _embedded: {
        communities: Community[];
    };
    _links: Links2;
    page: Page;
}

// Helper function to validate the community structure
const validateCommunity = (community: any): boolean => {
    if (typeof community.id !== 'string') throw new Error('Invalid id');
    if (typeof community.uuid !== 'string') throw new Error('Invalid uuid');
    if (typeof community.name !== 'string') throw new Error('Invalid name');
    if (typeof community.handle !== 'string') throw new Error('Invalid handle');
    if (typeof community.archivedItemsCount !== 'number') throw new Error('Invalid archivedItemsCount');
    if (typeof community.type !== 'string') throw new Error('Invalid type');
    if (typeof community._links !== 'object') throw new Error('Invalid links');
    return true;
};

// Main function to fetch and validate communities
const makeCommunitiesList = async (): Promise<ListMetaDataItem[]> => {
    let resultPages: Community[] = [];
    let loading = true;

    const size = 100;

    try {
        let url = `${DSPACE_BASE_URL}/core/communities?size=${size}`;
        let hasNext = true;

        // Iterates through all the pages of the communities
        while (hasNext) {
            const data: RootObject = await fetchWithCache(url);

            // Check to ensure the communities array exists
            if (!data._embedded || !data._embedded.communities) {
                throw new Error('Communities array does not exist in the data');
            }

            // Validate each community in the data
            data._embedded.communities.forEach((community: Community) => {
                if (!validateCommunity(community)) {
                    throw new Error('Invalid community structure');
                }
            });

            resultPages = resultPages.concat(data._embedded.communities);
            if (data._links.next) {
                url = data._links.next.href;
            } else {
                hasNext = false;
            }
        }
    } catch (error) {
        throw error;
    } finally {
        loading = false;
    }

    const result: ListMetaDataItem[] = resultPages.map((community: Community): ListMetaDataItem => ({
        id: community.id,
        name: community.name,
        rowData: community,
    }));

    return result;
};

export default makeCommunitiesList;
