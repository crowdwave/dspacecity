import React, {useEffect, useState} from "react";

export const ListItemCount: React.FC = () => {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const handleCustomEvent = (event: CustomEvent) => {
            setCount(event.detail);
        };

        window.addEventListener("listItemCount", handleCustomEvent as EventListener);

        return () => {
            window.removeEventListener("listItemCount", handleCustomEvent as EventListener);
        };
    }, []);

    if (count === null) return null;

    return <div>{count === 1 ? `${count} item` : `${count} items`}</div>;
};