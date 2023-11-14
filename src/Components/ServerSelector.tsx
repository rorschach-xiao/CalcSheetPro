
import "./ServerSelector.css";
// define the props for ServerSelector

interface ServerSelectorProps {
    serverSelector: (buttonName: string) => void;
    serverSelected: string;
}


function ServerSelector({ serverSelector, serverSelected }: ServerSelectorProps) {


    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        return null;
    }


    //
    // the callback that will take the name of the button and called serverSelector
    function onButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
        const buttonName = event.currentTarget.innerText;
        serverSelector(buttonName);
    } // onButtonClick

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        serverSelector(e.target.value);

    }
    function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        serverSelector(e.currentTarget.value);
    }
    return (
        // <nav>
        //     {/* <button onClick={onButtonClick}>localhost</button>
        //     <button onClick={onButtonClick}>renderhost</button> */}
        //     <select onChange={handleChange}>
        //         <option value="">SERVER</option>
        //         <option key="localhost" value="localhost">localhost</option>
        //         <option key="renderhost" value="renderhost">renderhost</option>
            
        //     </select>
        //     {/* current server: {serverSelected} */}
        // </nav>
        <nav>
        <div className="dropdown">
            <div className="dropdown-trigger">SERVER</div>
            <div className="dropdown-menu">
                <button key="localhost" value="localhost" onClick={handleButtonClick} 
                className={`${serverSelected=='localhost'?"selected":""}`}>localhost</button>
                <button key="renderhost" value="renderhost" onClick={handleButtonClick}
                className={`${serverSelected=='renderhost'?"selected":""}`}>renderhost</button>
            </div>
        </div>
        
    </nav>
    )
}

export default ServerSelector;