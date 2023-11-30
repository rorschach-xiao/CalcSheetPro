import io from 'socket.io-client';
import { PortsGlobal, LOCAL_WHITEBOARD_SERVER_URL, RENDER_WHITEBOARD_SERVER_URL } from '../ServerDataDefinitions';


function throttle(callback: (e: any) => any, delay: number) {
        let previousCall = new Date().getTime();
        return function (e: any) {
            const time = new Date().getTime();
    
            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback(e);
            }
        };
}

interface Drawing {
    pen: Pen,
    x0: number,
    y0: number,
    x1: number,
    y1: number
}

interface Pen {
    color: string,
    size: number
}

class WhiteboardClient {
    private _serverURL: string;
    private _localServerURL: string = LOCAL_WHITEBOARD_SERVER_URL;
    private _renderServerURL: string = RENDER_WHITEBOARD_SERVER_URL;
    private _serverPort: number = PortsGlobal.whiteboardServerPort;
    private _socket: any; 
    private _server: string;
    private _canvas: HTMLCanvasElement | null = null;
    private _cxt: CanvasRenderingContext2D | null = null;
    private _setCursor: (cursor: string|null) => void = (cursor: string|null) => {};
    private _pen: Pen = {
        // 默认颜色
        color: 'black',
        // 默认线宽
        size: 2,
    };
    private _drawings: Drawing[] = [];
    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _scale: number = 1;
    // 鼠标移动前坐标
    private _prevCursorX: number =  0;
    private _prevCursorY: number =  0;
    // 按住左键涂鸦
    private _leftMouseDown: boolean = false;
    // 按住右键移动画板
    private _rightMouseDown: boolean = false;

    constructor() {
        this._serverURL = `${this._renderServerURL}`;
        this._server = 'renderhost';
    }
    // 初始化画板
    init(canvasRef: React.MutableRefObject<null>, setCursor: (cursor: string|null) => void) {
        const that = this;
        // 获取画板元素及上下文对象
        this._canvas = canvasRef.current;
        this._cxt = this._canvas!.getContext('2d');
       
        // 当画板上进入不同状态时可通过此函数变换鼠标样式
        this._setCursor = setCursor;

        // 添加鼠标事件处理
        this._canvas!.addEventListener('mousedown', this.onMouseDown, false);
        // 释放鼠标事件处理
        this._canvas!.addEventListener('mouseup', this.onMouseUp, false);
        this._canvas!.addEventListener('mouseout', this.onMouseUp, false);
        this._canvas!.addEventListener('wheel', throttle(this.onMouseWheel, 10), false);
        // 移动鼠标事件处理
        this._canvas!.addEventListener('mousemove', throttle(this.onMouseMove, 10), false);

        // // 添加手机触屏事件处理
        // this._canvas!.addEventListener('touchstart', onTouchStart, false);
        // this._canvas!.addEventListener('touchend', onTouchEnd, false);
        // this._canvas!.addEventListener('touchcancel', onTouchEnd, false);
        // this._canvas!.addEventListener('touchmove', throttle(onTouchMove, 10), false);

        // 建立 socket.io 连接
        this._socket = io(this._serverURL, {
            reconnection: true, 
            reconnectionAttempts: 5, 
        });
        this._socket.emit('getDrawings'); 
        this._socket.on('drawing', (drawing: Drawing) => {
            that.onRecvDrawing(drawing);
        })
        this._socket.on('clear', () => {
            that._drawings = [];
            console.log("clear");
            that.redraw();
        })
        // 关闭浏览器 tab 页面，确保关闭 socket 连接
        window.onbeforeunload = () => {
            that._socket.disconnect();
        };
        // window resize, redraw
        window.addEventListener('resize', () => {
            console.log("resize");
            that.redraw();
        }, false);
        // 禁止右键唤起上下文菜单
        document.oncontextmenu = () => false;

        // 初始化画板
        this.redraw();
    }
    // 设置画笔颜色
    setColor(color: string) {
        this._pen.color = color;
    }

    // 每当移动画板、放大缩小画板、resize 窗口大小都需要重新绘制画板
    redraw() {
        // 设置画板长和宽为窗口大小
        const width = this._canvas!.offsetWidth;
        const height = this._canvas!.offsetHeight;
        this._canvas!.width = width;
        this._canvas!.height = height;


        // 设置白色背景
        this._cxt!.fillStyle = '#fff';
        this._cxt!.fillRect(0, 0, this._canvas!.width, this._canvas!.height);

        // 绘制所有笔划，存储在 drawings 中
        for (let drawing of this._drawings) {
            this.drawLine(
                drawing.pen,
                this.toX(drawing.x0),
                this.toY(drawing.y0),
                this.toX(drawing.x1),
                this.toY(drawing.y1),
            );
        }
    }
  
    // 画线段
    drawLine(pen: Pen , x0: number, y0: number, x1: number, y1: number) {
        this._cxt!.beginPath();
        this._cxt!.moveTo(x0, y0);
        this._cxt!.lineTo(x1, y1);
        this._cxt!.strokeStyle = pen.color;
        this._cxt!.lineWidth = pen.size;
        this._cxt!.stroke();
        this._cxt!.closePath();
    }
  
    /* 坐标转换函数开始 */

    // 转换为实际 x 坐标
    toX(xL: number) {
        return (xL + this._offsetX) * this._scale;
    }

    toY(yL: number) {
        return (yL + this._offsetY) * this._scale;
    }

    // 转换为逻辑坐标
    toLogicX(x: number) {
        return (x / this._scale) - this._offsetX;
    }

    toLogicY(y: number) {
        return (y / this._scale) - this._offsetY;
    }

    // 逻辑画板高度
    logicHeight() {
        return this._canvas!.height / this._scale;
    }

    // 逻辑画板宽度
    logicWidth() {
        return this._canvas!.width / this._scale;
    }


    // 当从服务器接收到涂鸦数据，需要在画板上实时绘制
    onRecvDrawing(drawing: Drawing) {
        console.log("onRecvDrawing");
        // 保存绘画数据
        this._drawings.push(drawing);
        // 绘制笔划
        this.drawLine(
            drawing.pen,
            this.toX(drawing.x0),
            this.toY(drawing.y0),
            this.toX(drawing.x1),
            this.toY(drawing.y1),
        );

    }
    
    sendDrawing(drawing: any) {
        this._socket.emit('drawing', drawing);
    }
    clear() {
        this._socket.emit('clear');
    }

    //---------------MouseEvent Listeners-----------------//
    onMouseDown :(e: MouseEvent) => void = (e: MouseEvent) => {
        // 判断按键
        this._leftMouseDown = e.button === 0;
        this._rightMouseDown = e.button === 2;
        // if (this._leftMouseDown) {
        //     this._setCursor('crosshair');
        // } else if (this._rightMouseDown) {
        //     this._setCursor('move');
        // }
        // 更新鼠标移动前坐标
        this._prevCursorX = e.pageX - this._canvas!.getBoundingClientRect().left;
        this._prevCursorY = e.pageY - this._canvas!.getBoundingClientRect().top;
    }

    onMouseUp :(e: MouseEvent) => void = (e: MouseEvent) => {
        this._leftMouseDown = false;
        this._rightMouseDown = false;
        // 恢复默认鼠标样式
        // this._setCursor(null);
    }

    onMouseMove : (e: MouseEvent) => void = (e: MouseEvent) => {
        // 更新移动后坐标
        const cursorX = e.pageX - this._canvas!.getBoundingClientRect().left;
        const cursorY = e.pageY - this._canvas!.getBoundingClientRect().top;
  
        console.log("onMouseMove");
        // 按住左键移动鼠标进行涂鸦
        if (this._leftMouseDown) {
            const drawing = {
                pen: this._pen,
                x0: this.toLogicX(this._prevCursorX),
                y0: this.toLogicY(this._prevCursorY),
                x1: this.toLogicX(cursorX),
                y1: this.toLogicY(cursorY),
            };
            // 保存笔划
            this._drawings.push(drawing);
            console.log("onMouseDraw");
            // 把当前笔划发送到服务器
            this.sendDrawing(drawing);
            // 绘制笔划
            this.drawLine(
                this._pen,
                this._prevCursorX,
                this._prevCursorY,
                cursorX,
                cursorY,
            );
            this._prevCursorX = cursorX;
            this._prevCursorY = cursorY;
        }
    }

    onMouseWheel:(e: WheelEvent) => void = (e: WheelEvent) => {
        const deltaY = e.deltaY;
        const scaleAmount = -deltaY / 500;
        this._scale *= (1 + scaleAmount);
      
        var distX = e.pageX / this._canvas!.width;
        var distY = e.pageY / this._canvas!.height;
      
        const unitsZoomedX = this.logicWidth() * scaleAmount;
        const unitsZoomedY = this.logicHeight() * scaleAmount;
      
        const unitsAddLeft = unitsZoomedX * distX;
        const unitsAddTop = unitsZoomedY * distY;
      
        this._offsetX -= unitsAddLeft;
        this._offsetY -= unitsAddTop;
        console.log("onWheelMove");
        this.redraw();
      };
}
export default WhiteboardClient;
