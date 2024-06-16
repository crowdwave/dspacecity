import {ListData, SelectedItem} from "../listnavigator/listNavigatorTypes";
import {getListForRoot} from "./GetListForRoot";
import makeCommunitiesList from "./makeCommunitiesList";
import makeCollectionsList from "./makeCollectionsList";

export const onGetNextListCallback = async (selectedRow: SelectedItem | null): Promise<ListData | null> => {
    try {
        console.log('selectedRow: ', selectedRow)
        // null means startup/initialise so we pass in the root list
        if (selectedRow === null) {
            return getListForRoot()
        }
        if (selectedRow.listMetaDataItem.id === 'communities') {
            return await makeCommunitiesList()
        }
        if (selectedRow.listMetaDataItem.id === 'collections') {
            return await makeCollectionsList()
        }
        // maybe selected row should be including information about which list it belongs to
    } catch (e) {
        alert('error getting next list')
    }
    return null
}