import React, { useState, useEffect } from 'react';
import "./FileSelector.css";


  
interface Props {
    fetchFiles: () => Promise<string[]>;
    onFileSelect: (filename: string, userName: string) => void;
    userName: string;
}
const FileSelector: React.FC<Props> = ({fetchFiles, onFileSelect, userName}) => {

    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState('');

    useEffect(() => {
        fetchFiles().then(setFiles);
        //setFiles(f);
    }, [fetchFiles]);
  
    // function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    //     onFileSelect(e.target.value, userName);
    //     const selectedValue = e.target.value;
        
    //     setSelectedFile(selectedValue);
    //     // Restoring the "OPEN" option in the dropdown
    //     if (selectedValue === '') {
    //         setSelectedFile('');
    //     }
    // }

    function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        onFileSelect(e.currentTarget.value, userName);
        
    }

    return (
        <nav>
            <div className="dropdown">
                <div className="dropdown-trigger">OPEN</div>
                <div className="dropdown-menu">
                {files.map(f => (
                    <button value={f} onClick={handleButtonClick}>{f}</button>  
                ))}
                </div>
            </div>
            
        </nav>
    );
}
export default FileSelector;