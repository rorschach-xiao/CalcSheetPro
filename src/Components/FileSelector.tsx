import React from "react";
import { useState, useEffect } from 'react';


import Button from "./Button";
import "./Button.css";

interface FileSelectorProps {
    setDocumentName: (documentName: string) => void;
  }

const FileSelector: React.FC = () => {
    const [documents, setDocuments] = useState<string[]>([]);
  
    useEffect(() => {
      // Fetch list of documents from the backend server
      fetch('YOUR_BACKEND_ENDPOINT') // Replace with your actual endpoint
        .then(response => response.json())
        .then(data => setDocuments(data.documents))
        .catch(error => console.error('Error fetching documents:', error));
    }, []);
  
    const handleDocumentClick = (documentName: string) => {
        const currentURL = window.location.href;
        const index = currentURL.lastIndexOf('/');
        const newURL = currentURL.substring(0, index + 1) + documentName;
        window.history.pushState({}, '', newURL);
        //setDocumentName(documentName);
      };
  
    return (
      <div>
        <h2>Select a Document</h2>
        <ul>
          {documents.map((document, index) => (
            <li key={index} onClick={() => handleDocumentClick(document)}>
              {document}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default FileSelector;