export interface ListMetaDataItem {
    id: string;
    name: string;
    rowData?: unknown;
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

