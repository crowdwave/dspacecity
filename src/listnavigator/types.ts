export interface ListMetaDataItem {
    id: string;
    name: string;
}

export interface ListItemProps {
    listIndex: number;
    listMetaDataItem: ListMetaDataItem;
    color: string;
}

export interface SelectedItem {
    listIndex: number;
    listMetaDataItem: ListMetaDataItem;
}

export interface ListData {
    color: string;
    index: number;
    listMetaDataItem: ListMetaDataItem[];
    selectedListItemMetaData: ListMetaDataItem | null;
}

export interface ListComponentProps {
    listData: ListData;
    isLastList: boolean;
}