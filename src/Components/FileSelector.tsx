

// define the props for FileSelector

interface FileSelectorProps {
    fileSelector: (buttonName: string) => void;
    fileSelected: string;
}

function FileSelector({ fileSelector, fileSelected }: FileSelectorProps) {


    



    //
    // the callback that will take the name of the button and called serverSelector
    function onButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
        const fileName = event.currentTarget.innerText;
        fileSelector(fileName);
    } // onButtonClick
    

    return (
        <div>
            <button onClick={onButtonClick}>localhost</button>
            <button onClick={onButtonClick}>renderhost</button>
            current server: {serverSelected}
        </div>
    )
}

export default ServerSelector;