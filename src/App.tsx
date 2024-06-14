import React, {useState} from "react";
import {Start} from "./Start";

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

                    .App {
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

                    .App-sidebar {
                        background-color: white; /* First blue color */
                        border-right: 1px solid #ddd;
                        overflow-y: auto;
                        position: relative;
                    }

                    .App-content {
                        flex: 1;
                        padding: 20px;
                        overflow-y: auto;
                        text-align: left;
                    }

                    h1, h2, p {
                        margin: 0;
                        padding: 0;
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

                    .resizable-handle {
                        width: 10px;
                        cursor: ew-resize;
                        background-color: rgba(0, 0, 0, 0.1);
                        position: absolute;
                        right: 0;
                        top: 0;
                        bottom: 0;
                    }

                    pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        background: #f4f4f4;
                        padding: 10px;
                        border: 1px solid #ddd;
                    }
                `}
            </style>

            <div className="App">
                <header className="App-header">
                    <h1>dSPACE city</h1>
                </header>
                <div className="App-body">
                    <aside
                        className="App-sidebar"
                        style={{width: sidebarWidth}}
                    >
                        <Start/>
                        <div
                            className="resizable-handle"
                            onMouseDown={handleMouseDown}
                        ></div>
                    </aside>
                    <main className="App-content">
                        <h2>Welcome to DSpace Browser</h2>
                        <p>Select a category from the left to view its collections.</p>
                        {selectedItemData && (
                            <div>
                                <h3>Selected Item Data</h3>
                                <pre>{JSON.stringify(selectedItemData, null, 2)}</pre>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};
