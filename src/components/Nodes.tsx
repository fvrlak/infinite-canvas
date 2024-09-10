'use client';

import React, { useState, forwardRef, useImperativeHandle, useCallback, useMemo, useRef, useEffect } from 'react';

interface NodeProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  selected: boolean;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromPoint: 'top' | 'right' | 'bottom' | 'left';
  toPoint: 'top' | 'right' | 'bottom' | 'left';
}

const ResizeHandle: React.FC<{ position: string; onMouseDown: (e: React.MouseEvent) => void }> = ({ position, onMouseDown }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '14px',
    height: '14px',
    background: 'blue',
    borderRadius: '50%',
    ...(() => {
      switch (position) {
        case 'nw': return { top: '-7px', left: '-7px', cursor: 'nwse-resize' };
        case 'ne': return { top: '-7px', right: '-7px', cursor: 'nesw-resize' };
        case 'sw': return { bottom: '-7px', left: '-7px', cursor: 'nesw-resize' };
        case 'se': return { bottom: '-7px', right: '-7px', cursor: 'nwse-resize' };
        default: return {};
      }
    })()
  };

  return <div style={style} onMouseDown={onMouseDown} />;
};

const ConnectionPoint: React.FC<{
  position: 'top' | 'right' | 'bottom' | 'left';
  onStartConnection: (nodeId: string, point: 'top' | 'right' | 'bottom' | 'left') => void;
  onCompleteConnection: (nodeId: string, point: 'top' | 'right' | 'bottom' | 'left') => void;
  nodeId: string;
}> = ({ position, onStartConnection, onCompleteConnection, nodeId }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    background: 'green',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 10,
    ...(() => {
      switch (position) {
        case 'top': return { top: '-10px', left: 'calc(50% - 6px)' };
        case 'right': return { top: 'calc(50% - 6px)', right: '-10px' };
        case 'bottom': return { bottom: '-10px', left: 'calc(50% - 6px)' };
        case 'left': return { top: 'calc(50% - 6px)', left: '-10px' };
      }
    })()
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartConnection(nodeId, position);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompleteConnection(nodeId, position);
  };

  return (
    <div 
      style={style} 
      onMouseDown={handleMouseDown} 
      onMouseUp={handleMouseUp}
      onMouseEnter={(e) => {
        if (e.buttons === 1) { // If the primary mouse button is pressed
          handleMouseUp(e);
        }
      }}
    />
  );
};

const Node: React.FC<NodeProps & { 
  zoom: number; 
  canvasOffset: { x: number; y: number };
  onSelect: (id: string | null) => void;
  onResize: (id: string, width: number, height: number) => void;
  onMove: (id: string, x: number, y: number) => void;
  onEdit: (id: string, content: string) => void;
  onStartConnection: (nodeId: string, point: 'top' | 'right' | 'bottom' | 'left') => void;
  onCompleteConnection: (nodeId: string, point: 'top' | 'right' | 'bottom' | 'left') => void;
  isShiftPressed: boolean;
  onShiftClick: (id: string) => void;
}> = ({ id, x, y, width, height, content, zoom, canvasOffset, selected, onSelect, onResize, onMove, onEdit, onStartConnection, onCompleteConnection, isShiftPressed, onShiftClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const style: React.CSSProperties = useMemo(() => ({
    transform: `translate3d(${(x + canvasOffset.x) * zoom}px, ${(y + canvasOffset.y) * zoom}px, 0) scale(${zoom})`,
    transformOrigin: 'top left',
    willChange: 'transform',
    pointerEvents: 'auto',
    padding: '8px',
    fontSize: '14px',
    width: `${width}px`,
    height: `${height}px`,
    border: selected ? '2px solid blue' : '1px solid gray',
    backgroundColor: selected ? 'lightblue' : 'white',
    cursor: isEditing ? 'text' : (isDragging ? 'grabbing' : 'grab'),
    overflow: 'hidden',
    position: 'absolute',
  }), [x, y, zoom, canvasOffset, selected, width, height, isEditing, isDragging]);

  const contentStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    overflow: 'auto',
    padding: '4px',
  }), []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShiftPressed) {
      onShiftClick(id);
    } else {
      onSelect(selected ? null : id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (textareaRef.current) {
      onEdit(id, textareaRef.current.value);
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startNodeX = x;
    const startNodeY = y;

    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      onMove(id, startNodeX + dx, startNodeY + dy);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [id, x, y, zoom, onMove, isEditing]);

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
      onDoubleClick={handleDoubleClick}
    >
      <div style={contentStyle}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            defaultValue={content}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              resize: 'none',
              background: 'transparent',
              fontSize: 'inherit',
              fontFamily: 'inherit',
            }}
            onBlur={handleBlur}
          />
        ) : (
          <pre style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}>
            {content}
          </pre>
        )}
      </div>
      {selected && !isEditing && (
        <>
          <ResizeHandle position="nw" onMouseDown={(e) => handleResize(e, 'nw')} />
          <ResizeHandle position="ne" onMouseDown={(e) => handleResize(e, 'ne')} />
          <ResizeHandle position="sw" onMouseDown={(e) => handleResize(e, 'sw')} />
          <ResizeHandle position="se" onMouseDown={(e) => handleResize(e, 'se')} />
        </>
      )}
      <ConnectionPoint position="top" onStartConnection={onStartConnection} nodeId={id} onCompleteConnection={onCompleteConnection} />
      <ConnectionPoint position="right" onStartConnection={onStartConnection} nodeId={id} onCompleteConnection={onCompleteConnection} />
      <ConnectionPoint position="bottom" onStartConnection={onStartConnection} nodeId={id} onCompleteConnection={onCompleteConnection} />
      <ConnectionPoint position="left" onStartConnection={onStartConnection} nodeId={id} onCompleteConnection={onCompleteConnection} />
    </div>
  );
};

interface NodesProps {
  canvasOffset: { x: number; y: number };
  zoom: number;
  onNodeSelect: (id: string | null) => void;
  isShiftPressed: boolean;
}

interface ActiveConnection extends Partial<Connection> {
    mouseX?: number;
    mouseY?: number;
}

export interface NodesRef {
  addNode: (x: number, y: number) => void;
  deselectAll: () => void;
  deleteNode: (id: string) => void;
  deleteConnection: (id: string) => void;
}

const Nodes = forwardRef<NodesRef, NodesProps>(({ canvasOffset, zoom, onNodeSelect, isShiftPressed }, ref) => {
  const [nodes, setNodes] = useState<NodeProps[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<ActiveConnection | null>(null);
  const [selectedForConnection, setSelectedForConnection] = useState<string | null>(null);

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

  const deleteNode = useCallback((id: string) => {
    setNodes(prevNodes => prevNodes.filter(node => node.id !== id));
    onNodeSelect(null);
  }, [onNodeSelect]);

  const editNode = useCallback((id: string, content: string) => {
    setNodes(prevNodes => prevNodes.map(node =>
      node.id === id ? { ...node, content } : node
    ));
  }, []);

  // Handle the starting point of a connection
  const startConnection = useCallback((nodeId: string, point: 'top' | 'right' | 'bottom' | 'left') => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const { x, y } = node;
      setActiveConnection({ 
        from: nodeId, 
        fromPoint: point, 
        mouseX: (x + canvasOffset.x) * zoom, 
        mouseY: (y + canvasOffset.y) * zoom 
      });
    }
  }, [nodes, canvasOffset, zoom]);

  // Handle completing the connection
  const completeConnection = useCallback((nodeId: string, point: 'top' | 'right' | 'bottom' | 'left') => {
    if (activeConnection && activeConnection.from !== nodeId) {
      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        from: activeConnection.from!,
        to: nodeId,
        fromPoint: activeConnection.fromPoint!,
        toPoint: point,
      };
      setConnections(prev => [...prev, newConnection]);
      setActiveConnection(null);  // Reset active connection
    }
  }, [activeConnection]);

  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  }, []);

  const handleShiftClick = useCallback((nodeId: string) => {
    console.log('Shift-click on node:', nodeId);
    if (selectedForConnection && selectedForConnection !== nodeId) {
      console.log('Creating connection:', selectedForConnection, 'to', nodeId);
      // Create a connection
      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        from: selectedForConnection,
        to: nodeId,
        fromPoint: 'right', // You can adjust these default connection points
        toPoint: 'left',
      };
      setConnections(prev => {
        const updatedConnections = [...prev, newConnection];
        console.log('New connections:', updatedConnections);
        return updatedConnections;
      });
      setSelectedForConnection(null);
    } else {
      console.log('Setting selected for connection:', nodeId);
      setSelectedForConnection(nodeId);
    }
  }, [selectedForConnection]);

  useImperativeHandle(ref, () => ({
    addNode,
    deselectAll,
    deleteNode,
    deleteConnection,
  }), [addNode, deselectAll, deleteNode, deleteConnection]);

  // Calculate point coordinates for connections
  const getPointCoordinates = useCallback((node: NodeProps, point: 'top' | 'right' | 'bottom' | 'left') => {
    switch (point) {
      case 'top': return { x: node.x + node.width / 2, y: node.y };
      case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
      case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'left': return { x: node.x, y: node.y + node.height / 2 };
    }
  }, []);

  // Render connections between nodes
  const renderConnections = useCallback(() => {
    console.log('Rendering connections:', connections);
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) {
        console.log('Missing node for connection:', conn);
        return null;
      }

      const from = getPointCoordinates(fromNode, conn.fromPoint);
      const to = getPointCoordinates(toNode, conn.toPoint);

      console.log('Connection coordinates:', from, to);

      return (
        <line
          key={conn.id}
          x1={(from.x + canvasOffset.x) * zoom}
          y1={(from.y + canvasOffset.y) * zoom}
          x2={(to.x + canvasOffset.x) * zoom}
          y2={(to.y + canvasOffset.y) * zoom}
          stroke="red"
          strokeWidth={4 * zoom}
        />
      );
    });
  }, [connections, nodes, canvasOffset, zoom, getPointCoordinates]);

  useEffect(() => {
    console.log('Connections state updated:', connections);
  }, [connections]);

  return (
    <>
      <svg className="absolute inset-0 pointer-events-none z-10" width="100%" height="100%">
        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="blue" strokeWidth="2" />
        {renderConnections()}
        {activeConnection && (
          <line
            x1={activeConnection.mouseX || 0}
            y1={activeConnection.mouseY || 0}
            x2={(activeConnection.mouseX || 0) + 1} // Add a small offset to make the line visible
            y2={(activeConnection.mouseY || 0) + 1}
            stroke="black"
            strokeWidth={2 * zoom}
            strokeDasharray="5,5"
          />
        )}
      </svg>
      <div 
        className="absolute inset-0 pointer-events-none z-20"
        onMouseMove={(e) => {
          if (activeConnection) {
            setActiveConnection(prev => ({
              ...prev!,
              mouseX: e.clientX,
              mouseY: e.clientY,
            }));
          }
        }}
        onMouseUp={() => setActiveConnection(null)}
      >
        {nodes.map((node) => (
          <Node
            key={node.id}
            {...node}
            zoom={zoom}
            canvasOffset={canvasOffset}
            onSelect={selectNode}
            onResize={resizeNode}
            onMove={moveNode}
            onEdit={editNode}
            onStartConnection={startConnection}
            onCompleteConnection={completeConnection}
            isShiftPressed={isShiftPressed}
            onShiftClick={handleShiftClick}
          />
        ))}
      </div>
    </>
  );
});

Nodes.displayName = 'Nodes';

export default Nodes;
