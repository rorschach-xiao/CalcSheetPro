import { useState, useEffect, useRef, Fragment } from 'react';
import WhiteBoardClient from '../Engine/WhiteBoardClient';
import './WhiteBoard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';


const whiteBoardClient = new WhiteBoardClient();
interface WhiteBoardProps {
    isOpen: boolean;
    handleWhiteBoardToggle: () => void;
}
function WhiteBoard({isOpen, handleWhiteBoardToggle}: WhiteBoardProps) {
    const canvasRef = useRef(null);
    const [cursor, setCursor] = useState<string | null>(null);
    const [isWhiteBoardOpen, setIsWhiteBoardOpen] = useState(isOpen);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // 启动 socket 连接，初始化共享画板组件
    useEffect(() => {
      console.log("Initializing canvas...");
      whiteBoardClient.init(canvasRef, setCursor)
    }, [isOpen]);

    const colorClass = (color: string) => {
      let c = `${color}-pen`;
      if (selectedColor === color) {
        c += '-selected';
      }
      return c;
    };
  
    // 点击颜色组件选色处理函数
    const selectColor = (color: string) => {
      setSelectedColor(color);
      whiteBoardClient.setColor(color);
    };

    // 点击清除按钮处理函数
    const handleClear = () => {
      whiteBoardClient.clear();
    };

    const toggleSidebar = () => {
      setIsWhiteBoardOpen(false);
      handleWhiteBoardToggle();
    };
    
    function getWhiteBoardTopContainer() {
      //if (isSidebarOpen) {
      return (<div className={`whiteboard-top-container ${isWhiteBoardOpen ? "": "close"}`}>
                <button onClick={toggleSidebar} className='close-button'>
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"/>
                  </svg>

                </button>
                <label className={`label`}>Whiteboard</label>
              </div>)
    }


    return (

          <Fragment>
            {getWhiteBoardTopContainer()}
            {/* canvas */}
            <canvas ref={canvasRef} id="canvas" height="500" width="500"></canvas>
            {/* bottom panel */}
            <div className="bottom-panel">
              <div className="pen-panel">
                <div className={colorClass('black')} onClick={() => selectColor('black')}></div>
                <div className={colorClass('red')} onClick={() => selectColor('red')}></div>
                <div className={colorClass('green')} onClick={() => selectColor('green')}></div>
                <div className={colorClass('blue')} onClick={() => selectColor('blue')}></div>
                <div className={colorClass('yellow')} onClick={() => selectColor('yellow')}></div>
              </div>
              <div className="btn-panel">
                <button onClick={handleClear}>
                  <FontAwesomeIcon icon={faRotateRight} />
                </button>
              </div>
            </div>
          </Fragment>

    );
}
export default WhiteBoard;
  