import {ListData, ListMetaDataItem} from "../listnavigator/listNavigatorTypes";
import {makeList} from "./makeList";
import {colorPalettes} from "../colorPalettes";

export const getListForRoot = (): ListData => {
    //return selectedRow.listMetaDataItem.id === 'root'
    const listMetaDataItems: ListMetaDataItem[] = [
        {id: 'communities', name: 'Communities'},
        {id: 'collections', name: 'Collections'},
        {id: 'items', name: 'Items'},
        {id: 'authors', name: 'Authors'},
    ]
    return makeList(listMetaDataItems, 'rootlist', colorPalettes['ocean'])
}