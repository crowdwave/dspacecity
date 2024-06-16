import {ListData} from "../listnavigator/listNavigatorTypes";
import {setListItemCount} from "../listnavigator/ListItemCount";

export const onListDisplayedCallback = async (selectedList: ListData) => {
    switch (selectedList.listIdentifier) {
        case 'rootlist':
            setListItemCount(null);
            break;
        case 'communities':
            setListItemCount(selectedList.listMetaDataItem.length);
            break;
        case 'collections':
            setListItemCount(selectedList.listMetaDataItem.length);
            break;
        default:
            break;
    }
}