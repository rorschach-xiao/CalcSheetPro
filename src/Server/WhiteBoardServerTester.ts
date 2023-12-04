import io from 'socket.io-client';
import { PortsGlobal } from '../ServerDataDefinitions';
import readline from 'readline';
import WhiteBoardClient from '../Engine/WhiteBoardClient';
import { useRef, useState } from 'react';
import WhiteBoard from '../Components/WhiteBoard';
import { Socket } from 'socket.io';

const port = PortsGlobal.whiteboardServerPort;
const baseURL = `http://localhost:${port}`;

const socket = io(baseURL, {
    reconnection: true,
    reconnectionAttempts: 5,
});


function drawCircle(socket : any , centerX : number, centerY : number, radius : number, color : string, size : number) {
    const points = 360; // 360 points for a circle
    const angleIncrement = (2 * Math.PI) / points;
  
    for (let i = 0; i < points; i++) {
      const x0 = centerX + radius * Math.cos(i * angleIncrement);
      const y0 = centerY + radius * Math.sin(i * angleIncrement);
  
      const x1 = centerX + radius * Math.cos((i + 1) * angleIncrement);
      const y1 = centerY + radius * Math.sin((i + 1) * angleIncrement);
  
      const drawing = {
        pen: { color, size },
        x0,
        y0,
        x1,
        y1,
      };
  
      socket.emit('drawing', drawing);
    }
}

function drawCat(socket: any, color : string, size : number) {
    // head
    const head = {
      pen: { color, size },
      x0: 200,
      y0: 200,
      x1: 250,
      y1: 200,
    };
  
    // body
    const body = {
      pen: { color, size },
      x0: 225,
      y0: 200,
      x1: 225,
      y1: 250,
    };
  
    // tail
    const tail = {
      pen: { color, size },
      x0: 225,
      y0: 250,
      x1: 250,
      y1: 275,
    };
  
    // left ear
    const leftEar = {
      pen: { color, size },
      x0: 200,
      y0: 180,
      x1: 210,
      y1: 160,
    };
  
    // right ear
    const rightEar = {
      pen: { color, size },
      x0: 250,
      y0: 180,
      x1: 240,
      y1: 160,
    };
  
    socket.emit('drawing', head);
    socket.emit('drawing', body);
    socket.emit('drawing', tail);
    socket.emit('drawing', leftEar);
    socket.emit('drawing', rightEar);
  }


function runTest() {

    // draw a line
    const drawing1 = {
        pen: { color: 'blue', size: 3 },
        x0: 10,
        y0: 20,
        x1: 50,
        y1: 80,
      };
    socket.emit('drawing', drawing1);

    // get all drawings
    socket.emit('getDrawings');
    
    // draw a line
    const drawing2 = {
        pen: { color: 'black', size: 3 },
        x0: 90,
        y0: 40,
        x1: 530,
        y1: 50,
      };
    socket.emit('drawing', drawing2);
        

    // draw a circle
    const centerX = 300;
    const centerY = 200;
    const radius = 50;
    let color = 'black';
    let size = 3;
    drawCircle(socket, centerX, centerY, radius, color, size);

    // draw a red "cat"
    color = 'red';
     size = 3;
    drawCat(socket, color, size);


    // clear the whiteboard
    setTimeout(() => {
        socket.emit('clear');
    }, 5000); // clear the whiteboard after 5 seconds
      
    // disconnect
    setTimeout(() => {
        socket.disconnect();
    }, 10000); // disconnect after 10 seconds
}

runTest();

