import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ListData,  SelectedItem} from "./listNavigatorTypes";
import {ListComponent} from "./ListComponent";

export interface VerticalNavigatorProps {
    onListDisplayedCallback: (selectedList: ListData) => Promise<void>;
    onRowSelectCallback: (selectedRow: SelectedItem, selectedList: ListData) => Promise<void>;
    onGetNextListCallback: (selectedRow: SelectedItem | null) => Promise<ListData | null>;
}

export const VerticalNavigator: React.FC<VerticalNavigatorProps> = (
    {
        onListDisplayedCallback,
        onRowSelectCallback,
        onGetNextListCallback,
    }
) => {
    const [getLists, setLists] = useState<ListData[]>([]);
    const prevListCount = useRef<number>(getLists.length);
    const isFetching = useRef<boolean>(false);  // Track whether a fetch is in progress

    const appendNewList = useCallback((listData: ListData) => {
        listData.index = getLists.length;
        setLists((prev) => [...prev, listData]);
    }, [getLists]);

    useEffect(() => {
        // Check if the number of lists has changed
        if (prevListCount.current !== getLists.length) {
            prevListCount.current = getLists.length;
            if (getLists.length > 0) {
                onListDisplayedCallback(getLists[getLists.length - 1]);
            }
        }
    }, [getLists, onListDisplayedCallback]);

    useEffect(() => {
        // user has selected a row
        const asyncHandler = async (event: CustomEvent<SelectedItem>) => {
            try {
                if (event.detail?.listIndex === undefined) return;
                if (event.detail?.listMetaDataItem === undefined) return;
                // Check if the new selected item is different from the current one
                const selectedItem: SelectedItem = event.detail;
                const indexOfSelectedList = selectedItem.listIndex;
                const selectedList = getLists[indexOfSelectedList];

                console.log('selectedItem')
                console.log(selectedItem)

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
                    if (!isFetching.current) {  // Check if a fetch is already in progress
                        isFetching.current = true;
                        const listData = await onGetNextListCallback(selectedItem)
                        if (listData !== null) appendNewList(listData);
                        isFetching.current = false;  // Reset the flag after the fetch is complete
                    }
                } else {
                    // user clicked on a list that is not the final list, remove all lists after the selected one
                    setLists((prevLists: ListData[]) => prevLists.slice(0, indexOfSelectedList + 1));
                }
                await onRowSelectCallback(selectedItem, selectedList);
            } catch (error) {
                isFetching.current = false;  // Reset the flag in case of an error
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
    }, [getLists, onGetNextListCallback, onRowSelectCallback, appendNewList]);

    useEffect(() => {
        // Define the async function
        const fetchListMetaDataItems = async () => {
            if (!isFetching.current) {  // Check if a fetch is already in progress
                isFetching.current = true;
                try {
                    // on startup/init we ask for the next list, passing null
                    const listData = await onGetNextListCallback(null)
                    if (listData !== null) appendNewList(listData);
                } catch (error) {
                    alert('error getting next list')
                } finally {
                    isFetching.current = false;
                }
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
