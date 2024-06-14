import React from "react";
import {ListData, ListMetaDataItem} from "./types";
import {ListItem} from "./ListItem";

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
                        <ListItem
                            listIndex={listData.index}
                            key={listMetaDataItem.id}
                            listMetaDataItem={listMetaDataItem}
                            color={listData.color}
                        />
                    ))
                    : listData.selectedListItemMetaData !== null && (
                    <ListItem
                        listIndex={listData.index}
                        key={listData.selectedListItemMetaData.id}
                        listMetaDataItem={listData.selectedListItemMetaData}
                        color={listData.color}
                    />
                )}
            </ul>
        </>
    );
};