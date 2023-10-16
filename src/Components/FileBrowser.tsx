
// interact with the server to get the tasks

import React, { useState, useEffect, useCallback } from 'react';
//import Task from './task';
import { PortsGlobal } from '../ServerDataDefinitions';



const port = PortsGlobal.serverPort;

const hostname = window.location.hostname;
const baseURL = `http://${hostname}:${port}`;

// include a function to call with a document name to modify the URL
interface FileBrowserProps {
    resetURL: (documentName: string) => void;
}

export function FileBrowser({ resetURL }: FileBrowserProps) {

    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('test');

    // get a list of files
    const getAllDocuments = useCallback(() => {
        const requestURL = baseURL + '/documents';
        fetch(requestURL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            })
            .then((response) => {
                console.log(`response: ${response}`);
                return response.json();
            }
            ).then((json) => {
                console.log(`json: ${json}`);
                setFiles(json);
            }
            ).catch((error) => {
                console.log(`getDocuments error: ${error}`);
            }
            );
    }, []);
    

    // a helper function for displaying a list of files
    // return a button for a file
    // onclick should call the resetURL function
    function getButtonForFile(file: string) {
        return <button onClick={() =>
            resetURL(file)}>
            {file}
        </button>
    }

    // return a <ul> list of the files, each button has the name of the file name
    function getFilesDisplay() {
        getAllDocuments();
        return <ul>
            {files.map((file) => {
                console.log(file);
                return <li key={file}>
                    {getButtonForFile(file)}
                </li>
            })}
        </ul>
    }

    function getControlButton() {
        return <div>
            <button onClick={() => getFilesDisplay()}>File Browser</button>
        </div>
    }

    return <div>
        {getControlButton()}
        {getFilesDisplay()}
    </div>
}

export default FileBrowser;
