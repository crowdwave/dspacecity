import {ListData, SelectedItem} from "../listnavigator/listNavigatorTypes";

export const onRowSelectCallback = async (selectedRow: SelectedItem, selectedList: ListData) => {
    console.log('onRowSelectCallback: ', selectedRow, selectedList)

    // do something with the selected row
    console.log(Object.keys(selectedRow.listMetaDataItem))
}