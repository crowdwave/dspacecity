import React, {useEffect, useState} from "react";
import {ListItemCountEvent} from "./listNavigatorTypes";

export const setListItemCount = (count: number | null) => {
    const event = new CustomEvent("SET_LIST_ITEM_COUNT", {detail: count}) as ListItemCountEvent;
    document.dispatchEvent(event);
};

export const ListItemCount: React.FC = () => {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const handleCustomEvent = (event: ListItemCountEvent) => {
            if (typeof event.detail === "number" || event.detail === null) {
                setCount(event.detail);
            } else {
                console.error("Invalid event detail: expected number or null");
            }
        };
        const eventListener = handleCustomEvent as EventListener;
        document.addEventListener("SET_LIST_ITEM_COUNT", eventListener);
        return () => document.removeEventListener("SET_LIST_ITEM_COUNT", eventListener);
    }, []);

    if (count === null) return null;

    return <div>{count === 1 ? `${count} item` : `${count} items`}</div>;
};
