'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Nodes, { NodesRef } from './Nodes';

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

const NodeButton: React.FC<{ onSelect: () => void }> = ({ onSelect }) => {
  return (
    <button className="p-2 bg-gray-200 rounded" onClick={onSelect}>
      📌
    </button>
  );
};

interface Point {
  x: number;
  y: number;
}

interface DrawPath {
  points: Point[];
}

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'panning' | 'drawing' | 'adding_node' | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const nodesRef = useRef<NodesRef>(null);

  const getMousePos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom - offset.x,
      y: (e.clientY - rect.top) / zoom - offset.y,
    };
  };

  const drawPath = (path: DrawPath, ctx: CanvasRenderingContext2D) => {
    if (path.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(offset.x, offset.y);
    
    ctx.lineWidth = 2 / zoom;
    ctx.strokeStyle = 'red';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    paths.forEach(path => drawPath(path, ctx));
    if (currentPath) drawPath(currentPath, ctx);
    
    ctx.restore();
  };

  const resizeCanvas = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;
      redrawCanvas();
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (mode === 'drawing') {
      setCurrentPath({ points: [pos] });
    } else if (mode === 'panning') {
      setIsPanning(true);
    } else if (mode === 'adding_node' && nodesRef.current) {
      console.log('Adding node at:', pos.x, pos.y); // Debug log
      nodesRef.current.addNode(pos.x, pos.y);
      setMode(null); // Reset mode after adding a node
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (mode === 'drawing' && currentPath) {
      setCurrentPath(prev => ({
        points: [...prev!.points, pos]
      }));
    } else if (mode === 'panning' && isPanning) {
      setOffset(prev => ({
        x: prev.x + e.movementX / zoom,
        y: prev.y + e.movementY / zoom,
      }));
    }
    redrawCanvas();
  };

  const handleMouseUp = () => {
    if (mode === 'drawing' && currentPath) {
      setPaths(prev => [...prev, currentPath]);
      setCurrentPath(null);
    } else if (mode === 'panning') {
      setIsPanning(false);
    }
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.1), 10);

    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Get the mouse position relative to the canvas before zoom
    const mousePosBeforeZoom = {
        x: (mouseX / zoom) - offset.x,
        y: (mouseY / zoom) - offset.y,
    };

    // Update the zoom
    setZoom(newZoom);

    // Calculate the new offset so the mouse position stays consistent after zoom
    setOffset(prev => ({
        x: mouseX / newZoom - mousePosBeforeZoom.x,
        y: mouseY / newZoom - mousePosBeforeZoom.y,
    }));

    redrawCanvas();
  }, [zoom, offset, redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full bg-gray-100 z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <Nodes
        ref={nodesRef}
        canvasOffset={offset}
        zoom={zoom}
      />
      <div className="absolute top-4 left-4 flex space-x-2 z-20">
        <HandButton onSelect={() => setMode('panning')} />
        <PenButton onSelect={() => setMode('drawing')} />
        <NodeButton onSelect={() => setMode('adding_node')} />
      </div>
    </div>
  );
};

export default Canvas;
