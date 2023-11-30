import { useState, useEffect, useRef, Fragment } from 'react';
import WhiteBoardClient from '../Engine/WhiteBoardClient';
import './WhiteBoard.css';

const whiteBoardClient = new WhiteBoardClient();
interface WhiteBoardProps {
    isOpen: boolean;
}
function WhiteBoard({isOpen}: WhiteBoardProps) {
    const canvasRef = useRef(null);
    const [cursor, setCursor] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // 启动 socket 连接，初始化共享画板组件
    useEffect(() => {
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
    return (
    <Fragment>
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
            <button onClick={() => whiteBoardClient.clear()}>Clear</button>
          </div>
        </div>
     </Fragment>
    );
}
export default WhiteBoard;
  