import React from 'react';
import { PolygonSelection } from '@/types/types';

interface SelectionControlsProps {
  selections: PolygonSelection[];
  setSelections: React.Dispatch<React.SetStateAction<PolygonSelection[]>>;
}

const SelectionControls = ({
  selections,
  setSelections,
}: SelectionControlsProps) => {
  return (
    <div className="flex gap-4 flex-wrap">
      {selections.map((sel, idx) => (
        <button
          key={idx}
          onClick={() => {
            setSelections((prev) => {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                visible: !updated[idx].visible,
              };
              return updated;
            });
          }}
          className={`cursor-pointer
            px-2 py-1 min-w-[50px] text-base font-semibold rounded-full text-white transition-opacity duration-200 ${
              sel.visible === false ? 'opacity-30' : ''
            }`}
          style={{ backgroundColor: sel.color }}
        >
          {sel.label}
        </button>
      ))}
    </div>
  );
};

export default SelectionControls;
