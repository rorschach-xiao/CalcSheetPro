/**
 * @jest-environment jsdom
 */

import { useState, useEffect } from 'react';
import './App.css';
import SpreadSheet from './Components/SpreadSheet';
import FileBrowser from './Components/FileBrowser';
//import { BrowserRouter, useLocation } from 'react-router-dom';

function App() {


  const [documentName, setDocumentName] = useState(getDocumentNameFromWindow());
  //const memoryUsage = process.memoryUsage();
  useEffect(() => {
    if (window.location.href) {
      setDocumentName(getDocumentNameFromWindow());
    }
  }, [getDocumentNameFromWindow]);



  // for the purposes of this demo and for the final project
  // we will use the window location to get the document name
  // this is not the best way to do this, but it is simple
  // and it works for the purposes of this demo
  function getDocumentNameFromWindow() {
    const href = window.location.href;

    // remove  the protocol 
    const protoEnd = href.indexOf('//');
    // find the beginning of the path
    const pathStart = href.indexOf('/', protoEnd + 2);

    if (pathStart < 0) {
      // there is no path
      return '';
    }
    // get the first part of the path
    const docEnd = href.indexOf('/', pathStart + 1);
    if (docEnd < 0) {
      // there is no other slash
      return href.substring(pathStart + 1);
    }
    // there is a slash
    return href.substring(pathStart + 1, docEnd);

  }

  //callback function to reset the current URL to have the document name
  function resetURL(documentName: string) {
    // get the current URL
    const currentURL = window.location.href;
    // remove anything after the last slash
    const index = currentURL.lastIndexOf('/');
    const newURL = currentURL.substring(0, index + 1) + documentName;
    // set the URL
    window.history.pushState({}, '', newURL);
    // now reload the page
    window.location.reload();
  }

  if (documentName === '') {
    setDocumentName('test');
    resetURL('test');
  }

  function getSheetDisplay() {
    return <div>
      <SpreadSheet documentName={documentName} />
    </div>
  }

  function getControlPlane() {
    return <FileBrowser resetURL={resetURL} />
  }

  function getDisplayComponent() {
    if (documentName === 'files' || documentName === '') {
      return getControlPlane();
    } else {
      return getSheetDisplay();
    }
  }

  return (
    <BrowserRouter >
      <div className="App">
        <header className="App-header">
        {getDisplayComponent()}
        </header>

      </div>
    </BrowserRouter>
  );
}

export default App;


