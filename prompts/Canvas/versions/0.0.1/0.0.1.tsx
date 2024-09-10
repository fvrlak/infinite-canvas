'use client';

import React, { useRef, useState, useEffect } from 'react';

const PenButton: React.FC<{ onSelect: () => void }> = ({ onSelect }) => {
  return (
    <button className="p-2 bg-gray-200 rounded" onClick={onSelect}>
      🖊️
    </button>
  );
};

const HandButton: React.FC<{ onSelect: () => void }> = ({ onSelect }) => {
  return (
    <button className="p-2 bg-gray-200 rounded" onClick={onSelect}>
      ✋
    </button>
  );
};

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'panning' | 'drawing' | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const getCanvasCoordinates = (e: MouseEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e);
    setStartPos({ x, y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!startPos || !mode) return;

    const { x, y } = getCanvasCoordinates(e);

    if (mode === 'drawing') {
      const canvas = bufferCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(startPos.x - canvasOffset.x, startPos.y - canvasOffset.y);
          ctx.lineTo(x - canvasOffset.x, y - canvasOffset.y);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.stroke();
          setStartPos({ x, y });
          redrawCanvas();
        }
      }
    } else if (mode === 'panning') {
      const dx = x - startPos.x;
      const dy = y - startPos.y;

      setCanvasOffset((prevOffset) => ({
        x: prevOffset.x + dx,
        y: prevOffset.y + dy,
      }));

      setStartPos({ x, y });
      redrawCanvas();
    }
  };

  const handleMouseUp = () => {
    setStartPos(null);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const bufferCanvas = bufferCanvasRef.current;
    if (canvas && bufferCanvas) {
      const ctx = canvas.getContext('2d');
      const bufferCtx = bufferCanvas.getContext('2d');
      if (ctx && bufferCtx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bufferCanvas, canvasOffset.x, canvasOffset.y);
      }
    }
  };

  const handlePanSelect = () => {
    setMode('panning');
  };

  const handleDrawSelect = () => {
    setMode('drawing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const bufferCanvas = bufferCanvasRef.current;
    if (canvas && bufferCanvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bufferCanvas.width = window.innerWidth;
      bufferCanvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    if (mode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mode, startPos]);

  return (
    <div className="relative w-full h-screen">
      <canvas ref={canvasRef} className="border w-full h-full bg-gray-100" onMouseDown={handleMouseDown} />
      <canvas ref={bufferCanvasRef} className="hidden" />
      <div className="absolute top-4 left-4 flex space-x-2">
        <HandButton onSelect={handlePanSelect} />
        <PenButton onSelect={handleDrawSelect} />
      </div>
    </div>
  );
};

export default Canvas;
