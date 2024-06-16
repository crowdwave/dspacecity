import React from "react";
import {ListData, ListMetaDataItem} from "./listNavigatorTypes";
import {ListItem} from "./ListItem";
import {getColorAtIndex} from "../colorPalettes";

export interface ListComponentProps {
    listData: ListData;
    isLastList: boolean;
}


export const ListComponent: React.FC<ListComponentProps> = ({listData, isLastList}) => {

    return (
        <>
            <style> {/* language=CSS */ `
                .list-group {
                    list-style-type: none;
                    margin-bottom: 20px;
                    padding: 0;
                    padding-right: 10px;
                }
            `}
            </style>

            <ul className="list-group">
                {isLastList
                    ? listData.listMetaDataItem.map((listMetaDataItem: ListMetaDataItem) => (
                        listData.index !== null && <ListItem
                            listData={listData}
                            key={listMetaDataItem.id}
                            listMetaDataItem={listMetaDataItem}
                        />
                    ))
                    : listData.index !== null && listData.selectedListItemMetaData !== null && (
                    <ListItem
                        listData={listData}
                        key={listData.selectedListItemMetaData.id}
                        listMetaDataItem={listData.selectedListItemMetaData}
                    />
                )}
            </ul>
        </>
    );
};