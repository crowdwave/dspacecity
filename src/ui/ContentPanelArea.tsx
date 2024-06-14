import React from "react";

export const ContentPanelArea: React.FC<{ selectedItemData: any }> = ({selectedItemData}) => (
    <>
        <style>
            {/* language=CSS */ `
                .App-content {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    text-align: left;
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
    </>
);