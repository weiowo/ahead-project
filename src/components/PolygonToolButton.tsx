import React from 'react';

interface PolygonToolButtonProps {
  isDrawingMode: boolean;
  setIsDrawingMode: (isDrawing: boolean) => void;
  text: string;
}

const PolygonToolButton = ({
  isDrawingMode,
  setIsDrawingMode,
  text = 'Arbitrary Polygon',
}: PolygonToolButtonProps) => {
  return (
    <button
      className={`w-[200px] cursor-pointer rounded-full p-2 text-white transition-colors duration-300 ${
        isDrawingMode ? 'bg-green-500' : 'bg-red-500'
      }`}
      onClick={() => setIsDrawingMode(!isDrawingMode)}
    >
      {text} {isDrawingMode ? '(ON)' : '(OFF)'}
    </button>
  );
};

export default PolygonToolButton;
