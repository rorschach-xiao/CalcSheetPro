import React from "react";

import Cell from "../Engine/Cell";

import "./SheetComponent.css";


// a component that will render a two dimensional array of cells
// the cells will be rendered in a table
// the cells will be rendered in rows
// a click handler will be passed in

interface SheetComponentProps {
  cellsValues: Array<Array<string>>;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  currentCell: string;
  currentlyEditing: boolean;
  cellsBeingEdited: [string, string][];
} // interface SheetComponentProps




function SheetComponent({ cellsValues, onClick, currentCell, currentlyEditing, cellsBeingEdited }: SheetComponentProps) {

  /**
   * 
   * @param cell 
   * @returns the class name for the cell
   * 
   * if the cell is the current cell and the sheet is in edit mode
   * then the cell will be rendered with the class name "cell-editing"
   * 
   * if the cell is the current cell and the sheet is not in edit mode
   * then the cell will be rendered with the class name "cell-selected"
   * 
   * otherwise the cell will be rendered with the class name "cell"
   */
  function getCellClass(cell: string) {
    if (cell === currentCell && currentlyEditing) {
      return "cell-editing";
    }
    if (cell === currentCell) {
      return "cell-selected";
    }
    return "cell";
  }

  //console.log("cellsBeingEdited", cellsBeingEdited);

  const editorNames = new Map(cellsBeingEdited);

  console.log("cellsBeingEdited", editorNames);

  // function checkEditorInfo(cell: string) {
  //   const a = cell;
  //   if (getCellClass(cell) === "cell-editing") {
  //     return (<sub className="editor-info">{editorNames.get(cell)}</sub>);
  //   }
  // }


  return (
    <table className="table">
      <tbody>
        {/*add a row with column cellsValues */}
        <tr>
          <th></th>
          {cellsValues[0].map((col, colIndex) => (
            <th key={colIndex}>
              {Cell.columnNumberToName(colIndex)}
            </th>
          ))}
        </tr>
        {cellsValues.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td> {Cell.rowNumberToName(rowIndex)}</td>
            {row.map((cell, colIndex) => (
              <td key={colIndex}>
                <button
                  onClick={onClick}
                  value={cell}
                  cell-label={Cell.columnRowToCell(colIndex, rowIndex)}
                  data-testid={Cell.columnRowToCell(colIndex, rowIndex)}
                  className={(getCellClass(Cell.columnRowToCell(colIndex, rowIndex)))}
                >
                  {cell}
                  {/* {checkEditorInfo(Cell.columnRowToCell(colIndex, rowIndex))} */}
                  {editorNames.has(Cell.columnRowToCell(colIndex, rowIndex)) && (
                    <sub className="editor-info">
                      {editorNames.get(Cell.columnRowToCell(colIndex, rowIndex))}
                    </sub>
                  )}
                </button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
} // SheetComponent




export default SheetComponent;