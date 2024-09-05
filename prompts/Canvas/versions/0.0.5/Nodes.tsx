'use client';

import React, { useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';

interface NodeProps {
  id: string;
  x: number;
  y: number;
  content: string;
}

const Node: React.FC<NodeProps & { zoom: number }> = ({ id, x, y, content, zoom }) => {
  const style = useMemo(() => ({
    transform: `translate3d(${x}px, ${y}px, 0) scale(${zoom})`,
    transformOrigin: 'top left',
    willChange: 'transform',
    pointerEvents: 'auto' as const,
    padding: '8px',
    fontSize: '14px',
    minWidth: '100px',
    minHeight: '50px',
  }), [x, y, zoom]);

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded shadow-md"
      style={style}
    >
      {content}
    </div>
  );
};

interface NodesProps {
  canvasOffset: { x: number; y: number };
  zoom: number;
}

export interface NodesRef {
  addNode: (x: number, y: number) => void;
}

const Nodes = forwardRef<NodesRef, NodesProps>(({ canvasOffset, zoom }, ref) => {
  const [nodes, setNodes] = useState<NodeProps[]>([]);

  const addNode = useCallback((x: number, y: number) => {
    const newNode: NodeProps = {
      id: `node-${Date.now()}`,
      x: x,
      y: y,
      content: 'New Node',
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
  }, []);

  useImperativeHandle(ref, () => ({
    addNode
  }), [addNode]);

  const containerStyle = useMemo(() => ({
    transform: `translate3d(${canvasOffset.x * zoom}px, ${canvasOffset.y * zoom}px, 0)`,
    transformOrigin: 'top left',
    willChange: 'transform',
  }), [canvasOffset.x, canvasOffset.y, zoom]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20"
      style={containerStyle}
    >
      {nodes.map((node) => (
        <Node
          key={node.id}
          id={node.id}
          x={node.x * zoom}
          y={node.y * zoom}
          content={node.content}
          zoom={zoom}
        />
      ))}
    </div>
  );
});

Nodes.displayName = 'Nodes';

export default Nodes;