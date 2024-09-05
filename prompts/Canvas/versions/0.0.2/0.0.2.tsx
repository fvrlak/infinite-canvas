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

interface DrawLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'panning' | 'drawing' | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [drawLines, setDrawLines] = useState<DrawLine[]>([]);
  const [isPanning, setIsPanning] = useState(false);

  const getCanvasCoordinates = (e: MouseEvent | React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoordinates(e);
    setStartPos({ x, y });

    if (mode === 'panning') {
      setIsPanning(true);
    }
  };


const handleMouseMove = (e: React.MouseEvent) => {
  if (!startPos) return;

  const { x, y } = getCanvasCoordinates(e);

  if (mode === 'drawing' && !isPanning) {
    const newLine = {
      startX: startPos.x - canvasOffset.x,
      startY: startPos.y - canvasOffset.y,
      endX: x - canvasOffset.x,
      endY: y - canvasOffset.y,
    };
    setDrawLines((prevLines) => [...prevLines, newLine]);
    drawLine(newLine);
    setStartPos({ x, y });
  } else if (mode === 'panning' && isPanning) {
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

// ... existing code ...

  const handleMouseUp = () => {
    setStartPos(null);
    setIsPanning(false);
  };

  const drawLine = (line: DrawLine) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.save();
    ctx.translate(canvasOffset.x, canvasOffset.y);
    ctx.beginPath();
    ctx.moveTo(line.startX, line.startY);
    ctx.lineTo(line.endX, line.endY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines.forEach((line) => {
      drawLine(line);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d')!;
      const initialWidth = window.innerWidth;
      const initialHeight = window.innerHeight;

      canvas.width = initialWidth;
      canvas.height = initialHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      redrawCanvas();
    }
  }, [canvasOffset]);

  const handlePanSelect = () => {
    setMode('panning');
  };

  const handleDrawSelect = () => {
    setMode('drawing');
  };

  return (
    <div className="relative w-full h-screen">
      <canvas
        ref={canvasRef}
        className="border w-full h-full bg-gray-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="absolute top-4 left-4 flex space-x-2">
        <HandButton onSelect={handlePanSelect} />
        <PenButton onSelect={handleDrawSelect} />
      </div>
    </div>
  );
};

export default Canvas;
