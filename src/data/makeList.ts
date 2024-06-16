import {ColorPalette, ListData, ListIdentifier, ListMetaDataItem} from "../listnavigator/listNavigatorTypes";

import {colorPalettes} from "../colorPalettes";

export const makeList = (
    listMetaDataItems: ListMetaDataItem[],
    listIdentifier: ListIdentifier,
    colorPalette: ColorPalette = colorPalettes[0],
): ListData => {
        // index and selectedListItemMetaData are set dynamically during runtime by the ListNavigator
        return {
            listMetaDataItem: listMetaDataItems,
            listIdentifier: listIdentifier,
            selectedListItemMetaData: null,
            colorPalette: colorPalette,
            index: 0,
        };
    }
