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
    listIdentifier: ListIdentifier;
    listMetaDataItem: ListMetaDataItem[];
    selectedListItemMetaData: ListMetaDataItem | null;
}

export interface ListItemCountEvent extends CustomEvent {
    detail: number | null;
}

export type ListIdentifier = string;
