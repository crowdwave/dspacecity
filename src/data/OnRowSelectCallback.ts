import {ListData, SelectedItem} from "../listnavigator/listNavigatorTypes";

export const onRowSelectCallback = async (selectedRow: SelectedItem, selectedList: ListData) => {
    console.log('selectedRow: ', selectedRow)

    // do something with the selected row
    console.log(Object.keys(selectedRow.listMetaDataItem))
}