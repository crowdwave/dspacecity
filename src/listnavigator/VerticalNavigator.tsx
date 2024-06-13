import React, {useCallback, useEffect, useState} from 'react';
import {ListData, ListMetaDataItem, SelectedItem} from "./types";
import {colorPalette} from "../utils";
import {ListComponent} from "./ListComponent";


export interface VerticalNavigatorProps {
    onRowSelectCallback: (selectedRow: SelectedItem) => Promise<void>;
    onGetNextListCallback: (selectedRow: SelectedItem | null) => Promise<ListMetaDataItem[]>;
}

export const VerticalNavigator: React.FC<VerticalNavigatorProps> = (
    {
        onRowSelectCallback,
        onGetNextListCallback,
    }
) => {
    const [getLists, setLists] = useState<ListData[]>([]);

    // this is the top level component.
    // it starts with an initial list of items
    // it listens for the APPEND_NEW_LIST event and appends a new list to the list of lists
    // when the user selects an item, it is up to that item to run code that will append a new list, or not
    // the selected item is stored in the state and passed to the next list
    // when a new list is appended, the current list is collapsed and the new list is shown expanded
    // the new list is shown with a fade-in effect
    // the list items are truncated to 30 characters
    // when a user selects an item, if it is not the final list, and all others removed
    // the final list is shown expanded
    // lists prior to the final list show only their selected item

    const appendNewList = useCallback((listMetaDataItems: ListMetaDataItem[]) => {
        const index = getLists.length;
        const color = colorPalette[index % colorPalette.length];
        const newList: ListData = {
            index: index,
            listMetaDataItem: listMetaDataItems,
            selectedListItemMetaData: null,
            color: color,
        };
        setLists((prev) => [...prev, newList]);
    }, [getLists.length]);


    useEffect(() => {
        // user has selected a row
        const asyncHandler = async (event: CustomEvent<SelectedItem>) => {
            try {
                if (event.detail?.listIndex === undefined) return;
                if (event.detail?.listMetaDataItem === undefined) return;
                // Check if the new selected item is different from the current one
                const selectedItem: SelectedItem = event.detail;
                const indexOfSelectedList = selectedItem.listIndex;
                // when a row is selected, store that information in the list
                setLists((prevLists: ListData[]) => {
                    const newLists: ListData[] = Array.from(prevLists);
                    newLists[indexOfSelectedList].selectedListItemMetaData = selectedItem.listMetaDataItem;
                    return newLists;
                });
                // if the user clicks a row on any list other than the last one, remove all lists after the selected list
                const indexOfCurrentlyFinalList = getLists.length - 1;
                const selectedRowIsInFinalList: boolean = indexOfSelectedList === indexOfCurrentlyFinalList
                if (selectedRowIsInFinalList) {
                    // user clicked on the final list
                    // there may or may not be another list to display, null means no next list
                    const listMetaDataItems: ListMetaDataItem[] = await onGetNextListCallback(selectedItem)
                    if (listMetaDataItems !== null) appendNewList(listMetaDataItems);
                } else {
                    // user clicked on a list that is not the final list, remove all lists after the selected one
                    setLists((prevLists: ListData[]) => prevLists.slice(0, indexOfSelectedList + 1));
                }
                onRowSelectCallback(selectedItem);
            } catch (error) {
                alert('error handling user selection of row')
                console.log(error)
            }
        };
        const handler: EventListener = (event: Event) => {
            asyncHandler(event as CustomEvent<SelectedItem>).catch(error => {
                console.error('Error in asyncHandler:', error);
            });
        };

        document.addEventListener('LIST_ITEM_SELECTED', handler);
        return () => document.removeEventListener('LIST_ITEM_SELECTED', handler);
    }, [getLists]);


    useEffect(() => {
        const handler = (event: CustomEvent<ListMetaDataItem[]>) => {
            if (event.detail === null) return;
            const listMetaDataItems: ListMetaDataItem[] = event.detail;
            appendNewList(listMetaDataItems);
        };
        document.addEventListener('APPEND_NEW_LIST', handler as EventListener);
        return () => document.removeEventListener('APPEND_NEW_LIST', handler as EventListener);
    }, [getLists, appendNewList]);

    useEffect(() => {
        // Define the async function
        const fetchListMetaDataItems = async () => {
            try {
                // on startup/init we ask for the next list, passing null
                const listMetaDataItems: ListMetaDataItem[] = await onGetNextListCallback(null)
                if (listMetaDataItems !== null) appendNewList(listMetaDataItems);
            } catch (error) {
                alert('error getting next list')
            }
        };

        // Call the async function
        fetchListMetaDataItems();
    }, []);

    return (
        <>
            <style> {/* language=CSS */ `

                .verticalnavigatorcontainer {
                    padding: 10px;
                }

                .add-list-button {
                    margin-top: 20px;
                    padding: 10px 20px;
                    font-size: 1em;
                    font-weight: bold;
                    color: white;
                    background-color: #007bff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .add-list-button:hover {
                    background-color: #0056b3;
                }
            `}
            </style>

            <div
                id="verticalnavigator"
                className="verticalnavigatorcontainer">
                {getLists.map((listData: ListData, index) => (
                    <ListComponent
                        key={index}
                        listData={{...listData, index: index}}
                        isLastList={index === getLists.length - 1}
                    />
                ))}
            </div>
        </>
    );
};

