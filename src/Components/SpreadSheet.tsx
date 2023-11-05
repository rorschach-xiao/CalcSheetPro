import React, { useState, useEffect } from "react";
import Formula from "./Formula";
import Status from "./Status";
import KeyPad from "./KeyPad";
import SpreadSheetClient from "../Engine/SpreadSheetClient";
import getCellsBeingEdited from "../Engine/SpreadSheetController";
import SheetHolder from "./SheetHolder";
import FileSelector from "./FileSelector";

import { ButtonNames } from "../Engine/GlobalDefinitions";
import ServerSelector from "./ServerSelector";
import ChatPad from "./ChatPad";

import "./SpreadSheet.css";


interface SpreadSheetProps {
  documentName: string;
}

/**
 * the main component for the Spreadsheet.  It is the parent of all the other components
 * 
 *
 * */

// create the client that talks to the backend.
const spreadSheetClient = new SpreadSheetClient('test', 'juancho');

function SpreadSheet({ documentName }: SpreadSheetProps) {
  const [formulaString, setFormulaString] = useState(spreadSheetClient.getFormulaString())
  const [resultString, setResultString] = useState(spreadSheetClient.getResultString())
  const [cells, setCells] = useState(spreadSheetClient.getSheetDisplayStringsForGUI());
  const [statusString, setStatusString] = useState(spreadSheetClient.getEditStatusString());
  const [currentCell, setCurrentCell] = useState(spreadSheetClient.getWorkingCellLabel());
  const [currentlyEditing, setCurrentlyEditing] = useState(spreadSheetClient.getEditStatus());
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [fileName, setFileName] = useState(documentName);
  const [serverSelected, setServerSelected] = useState("localhost");


  function updateDisplayValues(): void {
    spreadSheetClient.userName = userName;
    spreadSheetClient.documentName = fileName;
    setFormulaString(spreadSheetClient.getFormulaString());
    setResultString(spreadSheetClient.getResultString());
    setStatusString(spreadSheetClient.getEditStatusString());
    setCells(spreadSheetClient.getSheetDisplayStringsForGUI());
    setCurrentCell(spreadSheetClient.getWorkingCellLabel());
    setCurrentlyEditing(spreadSheetClient.getEditStatus());
  }

  // useEffect to refetch the data every 1/20 of a second
  useEffect(() => {
    const interval = setInterval(() => {
      updateDisplayValues();
    }, 50);
    return () => clearInterval(interval);
  });


  function getUserLogin() {
    return <div>
      <input
        type="text"
        placeholder="User name"
        defaultValue={userName}
        id="inputName"
      />
      <button onClick={() => {
          // get the text from the input
          let inputElement: HTMLInputElement = document.getElementById('inputName') as HTMLInputElement;
          let userName = inputElement!.value;
          window.sessionStorage.setItem('userName', userName);
          // set the user name
          setUserName(userName);
          spreadSheetClient.userName = userName;
        }}>Login</button>
    </div>

  }

  function createNewSheet() {
    return <div >
    <label className="create-sheet-label">CREATE A SHEET</label>
    <input
      type="text"
      placeholder="Sheet Name"
      id="inputSheetName"
    />
    <button onClick={() => {
        // get the text from the input
        let inputElement: HTMLInputElement = document.getElementById('inputSheetName') as HTMLInputElement;
        let sheetName = inputElement!.value;
        window.sessionStorage.setItem('sheetName', sheetName);
        // set the sheet name
        setFileName(sheetName)
        spreadSheetClient.documentName = sheetName;
      }}>Create</button>
  </div>

} 

  function checkUserName(): boolean {
    if (userName === "") {
      alert("Please enter a user name");
      return false;
    }
    return true;
  }

  /**
   * 
   * @param event 
   * 
   * This function is the call back for the command buttons
   * 
   * It will call the machine to process the command button
   * 
   * the buttons done, edit, clear, all clear, and restart do not require asynchronous processing
   * 
   * the other buttons do require asynchronous processing and so the function is marked async
   */
  async function onCommandButtonClick(text: string): Promise<void> {

    if (!checkUserName()) {
      return;
    }

    switch (text) {


      case ButtonNames.edit_toggle:
        if (currentlyEditing) {
          spreadSheetClient.setEditStatus(false);
        } else {
          spreadSheetClient.setEditStatus(true);
        }
        setStatusString(spreadSheetClient.getEditStatusString());
        break;

      case ButtonNames.clear:
        spreadSheetClient.removeToken();
        break;

      case ButtonNames.allClear:
        spreadSheetClient.clearFormula();
        break;

    }
    // update the display values
    updateDisplayValues();
  }

  /**
   *  This function is the call back for the number buttons and the Parenthesis buttons
   * 
   * They all automatically start the editing of the current formula.
   * 
   * @param event
   * 
   * */
  function onButtonClick(event: React.MouseEvent<HTMLButtonElement>): void {
    if (!checkUserName()) {
      return;
    }
    const text = event.currentTarget.textContent;
    let trueText = text ? text : "";
    spreadSheetClient.setEditStatus(true);
    spreadSheetClient.addToken(trueText);

    updateDisplayValues();

  }

  // this is to help with development,  it allows us to select the server
  function serverSelector(buttonName: string) {
    setServerSelected(buttonName);
    spreadSheetClient.setServerSelector(buttonName);
  }


  /**
   * 
   * @param event 
   * 
   * This function is called when a cell is clicked
   * If the edit status is true then it will send the token to the machine.
   * If the edit status is false then it will ask the machine to update the current formula.
   */
  function onCellClick(event: React.MouseEvent<HTMLButtonElement>): void {

    if (userName === "") {
      alert("Please enter a user name");
      return;
    }
    const cellLabel = event.currentTarget.getAttribute("cell-label");
    // calculate the current row and column of the clicked on cell

    const editStatus = spreadSheetClient.getEditStatus();
    let realCellLabel = cellLabel ? cellLabel : "";


    // if the edit status is true then add the token to the machine
    if (editStatus) {
      spreadSheetClient.addCell(realCellLabel);  // this will never be ""
      updateDisplayValues();
    }
    // if the edit status is false then set the current cell to the clicked on cell
    else {
      spreadSheetClient.requestViewByLabel(realCellLabel);

      updateDisplayValues();
    }

  }

  async function getFiles(): Promise<string[]> {
    const fileNames: string[] = await spreadSheetClient.getDocuments()
    return fileNames;
  }

  function selectFiles(fileName: string, userName: string) {
    spreadSheetClient.getDocument(fileName, userName);
    setFileName(fileName);
    updateDisplayValues();
  }

  async function getCellsBeingEditedFromServer() : Promise<Map<string, string>> {
    return spreadSheetClient.getCellsBeingEdited(fileName);
  }

  return (
      <div>
        <FileSelector fetchFiles={getFiles} onFileSelect={selectFiles} userName={userName} />
        {createNewSheet()}
        <Formula formulaString={formulaString} resultString={resultString}  ></Formula>
        <Status statusString={statusString}></Status>
        {<SheetHolder cellsValues={cells}
          onClick={onCellClick}
          currentCell={currentCell}
          getCellsBeingEdited={getCellsBeingEditedFromServer} ></SheetHolder>}
        <KeyPad onButtonClick={onButtonClick}
          onCommandButtonClick={onCommandButtonClick}
          currentlyEditing={currentlyEditing}></KeyPad>
        {getUserLogin()}
        <ServerSelector serverSelector={serverSelector} serverSelected={serverSelected} />
        <ChatPad userName={userName}></ChatPad>
      </div>
  )
};

export default SpreadSheet;