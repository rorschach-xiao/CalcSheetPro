## Part 1
- We added a `FileSelector` component to the `SpreadSheet`. The `FileSelctor` will take two callback functions and the username as parameters. 
     - The first callback function `fetchFiles` will request documents name list from the server so that the `FileSelector` can display them as options. 
     - The second callback function `onFileSelect` will request the specific document from the server so that the front-end can update display value of the calcuation sheet.

- We also added a `<button>` in `SpreadSheet` to create a new empty calculation sheet by inputting the specific document name.

- Here are the places where you can find our implementation:
    - src/Components/FileSelector.tsx
    - src/Components/FileSelector.css
    - src/Components/SpreadSheet.tsx: 234-235 

## Part 2
- We added all the new buttons in `KeyPad` component and we also beautified the UI design.

- We added a private method `postfixHandler` in `FormulaEvaluator` to handle all the postfix operators and we also supported `Rand`, `e`, `Pi` token in `factor` method.

- Here are the places where you can find our implementation:
    - src/Components/KeyPad.tsx
    - src/Components/KeyPad.css
    - src/Components/FormulaEvaluator.tsx: 179-192
    - src/Components/FormulaEvaluator.tsx: 228-280 

## Part 3
- In the back-end, we added a `GET` method in `DocumentServer` to handle the `get` request from the front-end and send the `Map<string, string>` `CellsBeingEdited` obtained from `DocumentHolder` and `SpreadSheetController` to the front-end.

- In the front-end, we modified `SheetHolder` to receive a callback function `getCellsBeingEdited`, this callback function will be invoked when `cellsBeingEdited` in `SpreadSheetController` is changed, so we can always get the up-to-date information from back-end server.

- Furthermore, we fixed the lock bug in `SpreadSheetController`. We modified `requestViewAccess` and `releaseEditAccess` method to make sure that if a cell is currently being edited by a user, it can be view by other users while it can not be edited by other users.

- Here are the places where you can find our implementation:
    - src/Components/SpreadSheet.tsx: 228-230; 238-241
    - src/Components/SheetHolder.tsx
    - src/Components/SheetComponent.tsx
    - src/Components/SheetComponent.css
    - src/Server/DocumentServer.ts: 73-79
    - src/Engine/DocumentHolder.ts: 232-235
    - src/Engine/SpreadSheetController.ts: 167-169; 78-108; 145-157.