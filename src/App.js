import React, { useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import './App.css'; // Importa el archivo CSS

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const runObjectDetection = async () => {

      const net = await cocossd.load();

      const video = videoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      const detectObjects = async () => {
        const predictions = await net.detect(video);
        drawPredictions(predictions);
        requestAnimationFrame(detectObjects);
      };

      video.addEventListener('loadedmetadata', () => {
        video.play();
        detectObjects();
      });
    };

    runObjectDetection();
  }, []);

  const drawPredictions = (predictions) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const video = videoRef.current;
    const scaleFactor = canvas.width / video.width;

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      const label = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;

      const adjustedX = x * scaleFactor;
      const adjustedY = y * scaleFactor;
      const adjustedWidth = width * scaleFactor;
      const adjustedHeight = height * scaleFactor;

      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(adjustedX, adjustedY, adjustedWidth, adjustedHeight);

      ctx.fillStyle = '#00FFFF';
      ctx.fillRect(adjustedX, adjustedY - 20, label.length * 8, 20);
      ctx.fillStyle = '#000000';
      ctx.fillText(label, adjustedX, adjustedY - 5);
    });
  };

  return (
    <div className="App">
      <video ref={videoRef} autoPlay playsInline width="640" height="480" />
      <canvas ref={canvasRef} width="640" height="480" className="object-canvas" />
    </div>
  );
}

export default App;
