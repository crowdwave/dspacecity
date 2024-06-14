import React from "react";
import {SidebarStickyHeader} from "./SidebarStickyHeader";
import {Start} from "./Start";

export const Sidebar: React.FC<{ sidebarWidth: string; handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void }> = ({sidebarWidth, handleMouseDown}) => (
    <>
        <style>
            {/* language=CSS */ `
                .App-sidebar {
                    background-color: white; /* First blue color */
                    border-right: 1px solid #ddd;
                    overflow-y: auto;
                    position: relative;
                }

                .resizable-handle {
                    width: 10px;
                    cursor: ew-resize;
                    background-color: rgba(0, 0, 0, 0.1);
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                }
            `}
        </style>
        <aside
            className="App-sidebar"
            style={{width: sidebarWidth}}>
            <SidebarStickyHeader/>
            <Start/>
            <div
                className="resizable-handle"
                onMouseDown={handleMouseDown}></div>
        </aside>
    </>
);