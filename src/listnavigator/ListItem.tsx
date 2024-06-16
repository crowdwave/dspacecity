import React, {useEffect, useState} from "react";
import {ListData, ListMetaDataItem, SelectedItem} from "./listNavigatorTypes";
import {getColorAtIndex} from "../colorPalettes";

interface ListItemProps {
    listData: ListData;
    listMetaDataItem: ListMetaDataItem;
}

export const ListItem: React.FC<ListItemProps> = ({
                                                      listData,
                                                      listMetaDataItem,
                                                  }) => {
    const [getAnimate, setAnimate] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    // Utility function to truncate text
    const truncateText = (text: string, maxLength: number): string => {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    // Utility function to darken color
    const darkenColor = (hex: string, percent: number): string => {
        const hexValue = hex.replace('#', '');
        const r = parseInt(hexValue.substring(0, 2), 16);
        const g = parseInt(hexValue.substring(2, 4), 16);
        const b = parseInt(hexValue.substring(4, 6), 16);

        const darken = (color: number) => Math.max(0, Math.floor(color * (1 - percent / 100)));

        const darkenedR = darken(r).toString(16).padStart(2, '0');
        const darkenedG = darken(g).toString(16).padStart(2, '0');
        const darkenedB = darken(b).toString(16).padStart(2, '0');

        return `#${darkenedR}${darkenedG}${darkenedB}`;
    };

    const handleOnClick = () => {
        const selectedItem: SelectedItem = {
            listMetaDataItem: listMetaDataItem,
            listIndex: listData.index,
        };
        const event: CustomEvent<SelectedItem> = new CustomEvent('LIST_ITEM_SELECTED', {detail: selectedItem} as CustomEventInit<SelectedItem>);
        document.dispatchEvent(event);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setAnimate(true);
        }, 50);
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    const handleMouseEnter = () => {
        setIsRotating((prev) => !prev);
    };

    const handleMouseLeave = () => {
        return
        // Reset rotation state without triggering animation
        setIsRotating(false);
    };

    const listBackgroundColor = getColorAtIndex(listData.index, listData.colorPalette)

    return (
        <>
            <style> {/* language=CSS */ `
                .list-group-item {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 50ch;
                    padding: 5px 10px;
                    margin-bottom: 10px;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 8px;
                    color: white;
                    /*font-variant: small-caps;*/
                    font-weight: 400;
                    font-size: .9em;
                    display: flex;
                    align-items: center;
                    background-color: var(--bg-color, #7ec853);
                    opacity: 0; /* Start hidden */
                    transform: rotateX(90deg); /* Start rotated */
                    transition: opacity 0.5s, transform 0.5s; /* Animate changes */
                }

                .list-group-item.fade-enter-active {
                    opacity: 1; /* End visible */
                    transform: rotateX(0); /* End not rotated */
                }

                .list-group-item:hover {
                    background-color: ${darkenColor('#7ec853', 20)}; /* Darken by 20% on hover */
                }

                .list-group-item span {
                    display: inline-block;
                    transition: transform 0.5s;
                }

                .list-group-item span.rotate {
                    transform: rotateX(360deg);
                }

                .item-count {
                    font-size: 1em;
                    width: 2em;
                    text-align: left;
                    margin-right: 10px;
                }
            `}
            </style>

            <li
                key={listMetaDataItem.id}
                className={`list-group-item ${getAnimate ? 'fade-enter-active' : ''}`}
                style={{'--bg-color': listBackgroundColor} as React.CSSProperties}
                onClick={(e) => {
                    e.stopPropagation();
                    handleOnClick();
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <span
                    className={isRotating ? 'rotate' : ''}
                    onAnimationEnd={() => setIsRotating(false)}>
                    {truncateText(listMetaDataItem.name, 80)}
                </span>
            </li>
        </>
    );
};
