'use client';

import React, { useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';

interface NodeProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  selected: boolean;
}

const ResizeHandle: React.FC<{ position: string; onMouseDown: (e: React.MouseEvent) => void }> = ({ position, onMouseDown }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    background: 'blue',
    borderRadius: '50%',
    ...(() => {
      switch (position) {
        case 'nw': return { top: '-5px', left: '-5px', cursor: 'nwse-resize' };
        case 'ne': return { top: '-5px', right: '-5px', cursor: 'nesw-resize' };
        case 'sw': return { bottom: '-5px', left: '-5px', cursor: 'nesw-resize' };
        case 'se': return { bottom: '-5px', right: '-5px', cursor: 'nwse-resize' };
        default: return {};
      }
    })()
  };

  return <div style={style} onMouseDown={onMouseDown} />;
};

const Node: React.FC<NodeProps & { 
  zoom: number; 
  canvasOffset: { x: number; y: number };
  onSelect: (id: string | null) => void;
  onResize: (id: string, width: number, height: number) => void;
  onMove: (id: string, x: number, y: number) => void;
}> = ({ id, x, y, width, height, content, zoom, canvasOffset, selected, onSelect, onResize, onMove }) => {
  const style = useMemo(() => ({
    transform: `translate3d(${(x + canvasOffset.x) * zoom}px, ${(y + canvasOffset.y) * zoom}px, 0) scale(${zoom})`,
    transformOrigin: 'top left',
    willChange: 'transform',
    pointerEvents: 'auto' as const,
    padding: '8px',
    fontSize: '14px',
    width: `${width}px`,
    height: `${height}px`,
    border: selected ? '2px solid blue' : '1px solid gray',
    backgroundColor: selected ? 'lightblue' : 'white',
    cursor: 'move',
  }), [x, y, zoom, canvasOffset, selected, width, height]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(selected ? null : id);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target !== e.currentTarget) return; // Ignore if clicking on resize handle

    const startX = e.clientX;
    const startY = e.clientY;
    const startNodeX = x;
    const startNodeY = y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      onMove(id, startNodeX + dx, startNodeY + dy);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [id, x, y, zoom, onMove]);

  const handleResize = useCallback((e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) newWidth = Math.max(50, startWidth + dx);
      if (direction.includes('s')) newHeight = Math.max(50, startHeight + dy);
      if (direction.includes('w')) newWidth = Math.max(50, startWidth - dx);
      if (direction.includes('n')) newHeight = Math.max(50, startHeight - dy);

      onResize(id, newWidth, newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [id, width, height, zoom, onResize]);

  return (
    <div
      className="absolute rounded shadow-md"
      style={style}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {content}
      {selected && (
        <>
          <ResizeHandle position="nw" onMouseDown={(e) => handleResize(e, 'nw')} />
          <ResizeHandle position="ne" onMouseDown={(e) => handleResize(e, 'ne')} />
          <ResizeHandle position="sw" onMouseDown={(e) => handleResize(e, 'sw')} />
          <ResizeHandle position="se" onMouseDown={(e) => handleResize(e, 'se')} />
        </>
      )}
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
      width: 150,
      height: 100,
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

  const resizeNode = useCallback((id: string, width: number, height: number) => {
    setNodes(prevNodes => prevNodes.map(node => 
      node.id === id ? { ...node, width, height } : node
    ));
  }, []);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setNodes(prevNodes => prevNodes.map(node =>
      node.id === id ? { ...node, x, y } : node
    ));
  }, []);

  useImperativeHandle(ref, () => ({
    addNode,
    deselectAll
  }), [addNode, deselectAll]);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {nodes.map((node) => (
        <Node
          key={node.id}
          {...node}
          zoom={zoom}
          canvasOffset={canvasOffset}
          onSelect={selectNode}
          onResize={resizeNode}
          onMove={moveNode}
        />
      ))}
    </div>
  );
});

Nodes.displayName = 'Nodes';

export default Nodes;