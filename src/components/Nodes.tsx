'use client';

import React, { useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';

interface NodeProps {
  id: string;
  x: number;
  y: number;
  content: string;
  selected: boolean;
}

const Node: React.FC<NodeProps & { zoom: number; onSelect: (id: string | null) => void }> = 
  ({ id, x, y, content, zoom, selected, onSelect }) => {
  const style = useMemo(() => ({
    transform: `translate3d(${x}px, ${y}px, 0) scale(${zoom})`,
    transformOrigin: 'top left',
    willChange: 'transform',
    pointerEvents: 'auto' as const,
    padding: '8px',
    fontSize: '14px',
    minWidth: '100px',
    minHeight: '50px',
    border: selected ? '2px solid blue' : '1px solid gray',
    backgroundColor: selected ? 'lightblue' : 'white',
  }), [x, y, zoom, selected]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(selected ? null : id);  // Toggle selection
  };

  return (
    <div
      className="absolute rounded shadow-md"
      style={style}
      onClick={handleClick}
    >
      {content}
    </div>
  );
};

interface NodesProps {
  canvasOffset: { x: number; y: number };
  zoom: number;
  onNodeSelect: (id: string | null) => void;
}

export interface NodesRef {
  addNode: (x: number, y: number) => void;
  deselectAll: () => void;
}

const Nodes = forwardRef<NodesRef, NodesProps>(({ canvasOffset, zoom, onNodeSelect }, ref) => {
  const [nodes, setNodes] = useState<NodeProps[]>([]);

  const addNode = useCallback((x: number, y: number) => {
    const newNode: NodeProps = {
      id: `node-${Date.now()}`,
      x: x,
      y: y,
      content: 'New Node',
      selected: false,
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
  }, []);

  const selectNode = useCallback((id: string | null) => {
    setNodes(prevNodes => prevNodes.map(node => ({
      ...node,
      selected: node.id === id
    })));
    onNodeSelect(id);
  }, [onNodeSelect]);

  const deselectAll = useCallback(() => {
    setNodes(prevNodes => prevNodes.map(node => ({
      ...node,
      selected: false
    })));
    onNodeSelect(null);
  }, [onNodeSelect]);

  useImperativeHandle(ref, () => ({
    addNode,
    deselectAll
  }), [addNode, deselectAll]);

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
          {...node}
          x={node.x * zoom}
          y={node.y * zoom}
          zoom={zoom}
          onSelect={selectNode}
        />
      ))}
    </div>
  );
});

Nodes.displayName = 'Nodes';

export default Nodes;