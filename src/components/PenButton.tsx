'use client';

import React from 'react';

interface PenButtonProps {
  onDrawStart: (e: React.MouseEvent) => void;
}

const PenButton: React.FC<PenButtonProps> = ({ onDrawStart }) => {
  return (
    <button
      className="p-2 bg-gray-200 rounded"
      onMouseDown={onDrawStart}
    >
      🖊️
    </button>
  );
};

export default PenButton;