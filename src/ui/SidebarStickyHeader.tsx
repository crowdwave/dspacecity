import React from "react";
import {ListItemCount} from "../listnavigator/ListItemCount";

export const SidebarStickyHeader: React.FC = () => (
    <>
        <style>
            {/* language=CSS */ `
                .sidebar-header {
                    background-color: #007bff;
                    color: white;
                    padding: 10px;
                    font-size: 16px;
                    font-weight: bold;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
            `}
        </style>
        <div className="sidebar-header">
            <ListItemCount/>
        </div>
    </>
);