import {ListData, ListMetaDataItem, SelectedItem} from "../listnavigator/listNavigatorTypes";
import {getListForRoot} from "./GetListForRoot";
import makeCommunitiesList from "./makeCommunitiesList";
import makeCollectionsList, {Collection, CollectionsResponse} from "./makeCollectionsList";
import {fetchWithCache} from "./dataFetcher";
import {makeList} from "./makeList";
import {colorPalettes} from "../colorPalettes";

type Link = {
    href: string;
};

type RowData = {
    _links: RowDataLinks;
};

type RowDataLinks = {
    collections: Link;
    logo: Link;
    subcommunities: Link;
    parentCommunity: Link;
    communityGroup: Link;
    adminGroup: Link;
    self: Link;
};


export const onGetNextListCallback = async (selectedRow: SelectedItem | null): Promise<ListData | null> => {
    console.log(`onGetNextListCallback: selectedRow?.listIdentifier: ${selectedRow?.listIdentifier} selectedRow?.listMetaDataItem.id: ${selectedRow?.listMetaDataItem.id} `, selectedRow)
    try {
        console.log('selectedRow: ', selectedRow)
        // null means startup/initialise so we pass in the root list
        if (selectedRow === null) {
            return getListForRoot()
        }
        if (selectedRow?.listIdentifier === 'rootlist') {
            if (selectedRow.listMetaDataItem.id === 'communities') return await makeCommunitiesList()
            if (selectedRow.listMetaDataItem.id === 'collections') return await makeCollectionsList()
        }
        if (selectedRow?.listIdentifier === 'communities') {
            console.log('selectedRow.listMetaDataItem')
            const rowData: RowData = selectedRow.listMetaDataItem?.rowData as RowData
            console.log('rowData._links: ', rowData._links)

            let listMetaDataItems: ListMetaDataItem[] = [];

            const subCommunitiesLink = rowData._links.subcommunities.href
            const subCommunityData = await fetchWithCache(subCommunitiesLink);
            console.log('subCommunityData: ', subCommunityData)
            console.log(`subCommunityData.page.totalElements ${subCommunityData.page.totalElements}`)
            console.log('subCommunityData.page')
            console.log(subCommunityData.page)
            if (subCommunityData.page.totalElements > 0) {
                listMetaDataItems.push({
                    id: 'subcommunities',
                    name: `${subCommunityData.page.totalElements} subcommunities`,
                    rowData: {},
                })
            }

            const collectionsLink = rowData._links.collections.href
            const collectionData = await fetchWithCache(collectionsLink);
            console.log('collectionData: ', collectionData)
            console.log(`collectionData.page.totalElements ${collectionData.page.totalElements}`)
            console.log('collectionData.page')
            console.log(collectionData.page)
            if (collectionData.page.totalElements > 0) {
                listMetaDataItems.push({
                    id: 'collections',
                    name: `${collectionData.page.totalElements} collections`,
                    rowData: {},
                })
            }
            if (listMetaDataItems.length > 0) {
                return makeList(listMetaDataItems, 'submenu', colorPalettes.vibrant);
            } else {
                return null
            }

        }
        if (selectedRow?.listIdentifier === 'collections') {
            console.log('selectedRow.listMetaDataItem')
            const rowData: Collection = selectedRow.listMetaDataItem?.rowData as Collection;
            console.log('rowData: ', rowData)
            console.log('rowData._links: ', rowData._links)
            console.log('rowData._links.mappedItems.href: ', rowData._links.mappedItems.href)
            //console.log('rowData._embedded: ', rowData._embedded)
            //console.log('rowData._embedded.collections: ', rowData._embedded.collections)
            //console.log('rowData._embedded.collections[0]._links: ', rowData._embedded.collections[0]._links.mappedItems.href)

            let listMetaDataItems: ListMetaDataItem[] = [];

            const mappedItemsLink = rowData._links.mappedItems.href
            const mappedItemsData = await fetchWithCache(mappedItemsLink);
            console.log('mappedItemsData._embedded.mappedItems ', mappedItemsData._embedded.mappedItems)
            console.log(`subCommunityData.page.totalElements ${mappedItemsData.page.totalElements}`)
            console.log('subCommunityData.page')
            console.log(mappedItemsData.page)
            if (mappedItemsData.page.totalElements > 0) {
                listMetaDataItems.push({
                    id: 'subcommunities',
                    name: `${mappedItemsData.page.totalElements} mapped items`,
                    rowData: {},
                })
            }

            if (listMetaDataItems.length > 0) {
                return makeList(listMetaDataItems, 'submenu', colorPalettes.vibrant);
            } else {
                return null
            }

        }
    } catch (e) {
        console.log('error getting next list', e)
        alert('error getting next list')
    }
    return null
}