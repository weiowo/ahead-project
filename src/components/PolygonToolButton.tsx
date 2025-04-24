'use client';

import { useEffect, useState } from 'react';

interface PolygonToolButtonProps {
  isDrawingMode: boolean;
  setIsDrawingMode: (isDrawing: boolean) => void;
  text?: string;
}

export default function PolygonToolButton({
  isDrawingMode,
  setIsDrawingMode,
  text = 'Arbitrary Polygon',
}: PolygonToolButtonProps) {
  const [active, setActive] = useState(isDrawingMode);

  const handleClick = () => {
    setActive((prev) => !prev);
  };

  useEffect(() => {
    setIsDrawingMode(active);
  }, [active, setIsDrawingMode]);

  return (
    <button
      className={`w-[200px] cursor-pointer rounded-full p-2 text-white ${
        active ? 'bg-green-500' : 'bg-red-500'
      }`}
      onClick={handleClick}
    >
      {text} {active ? '(ON)' : '(OFF)'}
    </button>
  );
}
