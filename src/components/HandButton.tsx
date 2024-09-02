'use client';

import React from 'react';

interface HandButtonProps {
  onPanStart: (e: React.MouseEvent) => void;
}

const HandButton: React.FC<HandButtonProps> = ({ onPanStart }) => {
  return (
    <button
      className="p-2 bg-gray-200 rounded"
      onMouseDown={onPanStart}
    >
      ✋
    </button>
  );
};

export default HandButton;