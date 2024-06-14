import React, {useState} from "react";
import {Sidebar} from "./Sidebar";
import {ContentPanelArea} from "./ContentPanelArea";

export const App: React.FC = () => {
    const [selectedItemData, setSelectedItemData] = useState(null);
    const [sidebarWidth, setSidebarWidth] = useState(
        localStorage.getItem('sidebarWidth') || '500px'
    );

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const newWidth = `${e.clientX}px`;
        setSidebarWidth(newWidth);
        localStorage.setItem('sidebarWidth', newWidth);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <>
            <style>
                {/* language=CSS */ `
                    body {
                        font-family: 'Montserrat', sans-serif;
                        margin: 0;
                        padding: 0;
                    }

                    .App-header {
                        background-color: #007bff;
                        color: white;
                        padding: 20px;
                    }

                    .App-body {
                        display: flex;
                        height: calc(100vh - 80px); /* Adjust height based on header */
                    }

                    h1, h2, p {
                        margin: 0;
                        padding: 0;
                    }
                `}
            </style>

            <style>
                {/* language=CSS */ `
                    .App {
                    }

                    .list-group {
                        padding: 0;
                        list-style-type: none;
                    }

                    .list-group-item {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 100%;
                        padding: 10px;
                        text-align: left;
                        cursor: pointer;
                    }

                    .selected-item {
                        font-weight: bold;
                    }

                    .detail {
                        margin-top: 20px;
                    }
                `}
            </style>

            <div className="App">
                <header className="App-header">
                    <h1>dSPACE city</h1>
                </header>
                <div className="App-body">
                    <Sidebar sidebarWidth={sidebarWidth} handleMouseDown={handleMouseDown} />
                    <ContentPanelArea selectedItemData={selectedItemData} />
                </div>
            </div>
        </>
    );
};
