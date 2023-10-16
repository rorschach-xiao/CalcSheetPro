import React from "react";
import { useState, useEffect, useCallback } from 'react';
import { PortsGlobal } from '../ServerDataDefinitions';

import Button from "./Button";
import "./Button.css";

// interface FileSelectorProps {
//     setDocumentName: (documentName: string) => void;
//   }

// const FileSelector: React.FC = () => {
//     const [documents, setDocuments] = useState<string[]>([]);
  
//     useEffect(() => {
//       // Fetch list of documents from the backend server
//       fetch('YOUR_BACKEND_ENDPOINT') 
//         .then(response => response.json())
//         .then(data => setDocuments(data.documents))
//         .catch(error => console.error('Error fetching documents:', error));
//     }, []);
  
//     const handleDocumentClick = (documentName: string) => {
//         const currentURL = window.location.href;
//         const index = currentURL.lastIndexOf('/');
//         const newURL = currentURL.substring(0, index + 1) + documentName;
//         window.history.pushState({}, '', newURL);
//         //setDocumentName(documentName);
//       };
  
//     return (
//       <div>
//         <h2>Select a Document</h2>
//         <ul>
//           {documents.map((document, index) => (
//             <li key={index} onClick={() => handleDocumentClick(document)}>
//               {document}
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   };
  
//   export default FileSelector;

// interface FileSelectorProps {
//   documentName: string;
//   setDocumentName: (name: string) => void;
//   resetURL: (name: string) => void;
// }

// function FileSelector({ documentName, setDocumentName, resetURL }: FileSelectorProps) {
//   const [userDocuments, setUserDocuments] = useState<string[]>([]);

//   useEffect(() => {
//     // Assuming fetchUserDocuments() is an async function that fetches the user's documents
//     async function fetchDocs() {
//       try {
//         const response = await fetchUserDocuments(); // Implement this function
//         const data = await response.json();
//         setUserDocuments(data.documents); // Assuming data.documents is an array of document names
//       } catch (error) {
//         console.error('Error fetching user documents:', error);
//       }
//     }

//     fetchDocs();
//   }, []);

//   function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
//     const selectedDocument = event.target.value;
//     setDocumentName(selectedDocument);
//     resetURL(selectedDocument);
//   }

//   return (
//     <select value={documentName} onChange={handleSelectChange}>
//       {userDocuments.map((doc, index) => (
//         <option key={index} value={doc}>
//           {doc}
//         </option>
//       ))}
//     </select>
//   );
// }

// export default FileSelector;

const port = PortsGlobal.serverPort;

const hostname = window.location.hostname;
const baseURL = `http://${hostname}:${port}`;

interface FileSelectorProps {
  resetURL: (documentName: string) => void;
}

export function FileSelector({ resetURL }: FileSelectorProps) {

  const [files, setFiles] = useState<string[]>([]);
  const [newFileName, setNewFileName] = useState<string>('');

  const getDocuments = useCallback(() => {
      const requestURL = baseURL + "/documents"


      fetch(requestURL)
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
  // force a refresh 3 times a second.
  useEffect(() => {
      const interval = setInterval(() => {
          getDocuments();
      }, 333);
      return () => {
          clearInterval(interval);
      };
  }, []);

  // return a button for a file
  // onclick should call the resetURL function
  function getButtonForFile(file: string) {
      return <button onClick={() =>
          resetURL(file)}>
          {file}
      </button>
  }

  // return a <ul> list of the files
  function getFilesDisplay() {
      return <ul>
          {files.map((file) => {
              return <li key={file}>
                  {getButtonForFile(file)}
              </li>
          })}
      </ul>
  }

  function getNewFileButton() {
      // make a table with one row. and two columns
      return <table>
          <tbody>
              <tr>
                  <td>
                      <input
                          type="text"
                          placeholder="File name"
                          onChange={(event) => {
                              // get the text from the input
                              let taskName = event.target.value;
                              // set the file name
                              setNewFileName(taskName);
                          }}
                      />
                  </td>

                  <td> <button onClick={() => {
                      if (newFileName === '') {
                          alert("Please enter a file name");
                          return;
                      }
                      resetURL(newFileName);

                  }}>
                      Create New File
                  </button>
                  </td>
              </tr>
          </tbody>
      </table>
  }




  return <div>
      <h2>File Selector</h2>
      {getNewFileButton()}
      {getFilesDisplay()}
  </div>
}

export default FileSelector;
