import { DSPACE_BASE_URL, fetchWithCache } from "./dataFetcher";
import { ListMetaDataItem } from "../listnavigator/listNavigatorTypes";

interface Link {
  href: string;
}

interface MetadataItem {
  value: string;
  language: string | null;
  authority: string | null;
  confidence: number;
  place: number;
}

interface CollectionMetadata {
  "dc.identifier.uri"?: MetadataItem[];
  "dc.title"?: MetadataItem[];
  "dc.description"?: MetadataItem[];
  "dc.description.abstract"?: MetadataItem[];
}

interface WorkflowGroup {
  href: string;
  name: string;
}

interface CollectionLinks {
  harvester: Link;
  itemtemplate: Link;
  license: Link;
  logo: Link;
  mappedItems: Link;
  parentCommunity: Link;
  adminGroup: Link;
  submittersGroup: Link;
  itemReadGroup: Link;
  bitstreamReadGroup: Link;
  self: Link;
  workflowGroups: WorkflowGroup[];
}

interface Collection {
  id: string;
  uuid: string;
  name: string;
  handle: string;
  metadata: CollectionMetadata;
  archivedItemsCount: number;
  type: string;
  _links: CollectionLinks;
}

interface EmbeddedCollections {
  collections: Collection[];
}

interface CollectionsResponseLinks {
  first: Link;
  self: Link;
  next: Link;
  last: Link;
  search: Link;
}

interface PageInfo {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

interface CollectionsResponse {
  _embedded: EmbeddedCollections;
  _links: CollectionsResponseLinks;
  page: PageInfo;
}

// Helper function to validate the collection structure
const validateCollection = (collection: any): boolean => {
  if (typeof collection.id !== 'string') throw new Error('Invalid id');
  if (typeof collection.uuid !== 'string') throw new Error('Invalid uuid');
  if (typeof collection.name !== 'string') throw new Error('Invalid name');
  if (typeof collection.handle !== 'string') throw new Error('Invalid handle');
  if (typeof collection.archivedItemsCount !== 'number') throw new Error('Invalid archivedItemsCount');
  if (typeof collection.type !== 'string') throw new Error('Invalid type');
  if (typeof collection._links !== 'object') throw new Error('Invalid links');
  return true;
};

// Main function to fetch and validate collections
const makeCollectionsList = async (): Promise<ListMetaDataItem[]> => {
  let resultPages: Collection[] = [];
  let loading = true;

  const size = 1000;

  try {
    let url = `${DSPACE_BASE_URL}/core/collections?size=${size}`;
    let hasNext = true;

    // Iterates through all the pages of the collections
    while (hasNext) {
      const data: CollectionsResponse = await fetchWithCache(url);

      // Check to ensure the collections array exists
      if (!data._embedded || !data._embedded.collections) {
        throw new Error('Collections array does not exist in the data');
      }

      // Validate each collection in the data
      data._embedded.collections.forEach((collection: Collection) => {
        if (!validateCollection(collection)) {
          throw new Error('Invalid collection structure');
        }
      });

      resultPages = resultPages.concat(data._embedded.collections);
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

  const result: ListMetaDataItem[] = resultPages.map((collection: Collection): ListMetaDataItem => ({
    id: collection.id,
    name: collection.name,
    rowData: collection,
  }));

  return result;
};

export default makeCollectionsList;
