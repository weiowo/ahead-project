import React from 'react';
import { PolygonSelection } from '@/types/types';
import { Trash2, SquarePen, Check } from 'lucide-react';

interface PolygonPanelProps {
  selections: PolygonSelection[];
  setSelections: React.Dispatch<React.SetStateAction<PolygonSelection[]>>;
  isDrawingMode: boolean;
  setIsDrawingMode: (drawing: boolean) => void;
}

const PolygonPanel = ({
  selections,
  setSelections,
  isDrawingMode,
  setIsDrawingMode,
}: PolygonPanelProps) => {
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newLabel, setNewLabel] = React.useState('');

  const toggleVisibility = (index: number) => {
    setSelections((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        visible: !updated[index].visible,
      };
      return updated;
    });
  };

  const deleteSelection = (index: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete?');
    if (confirmDelete) {
      setSelections((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const confirmEdit = (idx: number) => {
    const trimmed = newLabel.trim();
    const isValid = /^[a-zA-Z0-9\-\_\(\)\+\'\&\.\s]+$/.test(trimmed); // <-- added \s for spaces
    const isDuplicate = selections.some(
      (s, i) => s.label === trimmed && i !== idx,
    );

    if (!isValid) {
      alert(
        'Label can only contain letters, numbers, hyphens, and underscores.',
      );
    } else if (isDuplicate) {
      alert('Duplicate label name.');
    } else {
      setSelections((prev) => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], label: trimmed };
        return updated;
      });
      setEditingIndex(null);
    }
  };

  const handleLabelKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === 'Enter') {
      confirmEdit(idx);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded-lg max-w-full">
      <div className="flex flex-col items-left justify-between mb-2 gap-2">
        <h3 className="hidden xl:block text-lg font-semibold">
          Arbitrary Polygon Panel
        </h3>
        <button
          className={`text-center px-4 py-1 rounded-full text-white cursor-pointer ${
            isDrawingMode ? 'bg-green-500' : 'bg-red-500'
          }`}
          onClick={() => setIsDrawingMode(!isDrawingMode)}
        >
          {isDrawingMode ? 'Finish Drawing Polygon' : 'Add Arbitrary Polygon'}
        </button>
      </div>
      <div className="max-h-[420px] overflow-y-auto flex flex-col gap-2">
        {selections.map((sel, idx) => {
          const isVisible = sel.visible !== false;
          const isEditing = editingIndex === idx;

          return (
            <div
              key={idx}
              className={`flex items-center w-full ${isVisible ? '' : 'opacity-40'}`}
            >
              <div className="flex items-center gap-2 flex-grow overflow-hidden">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => toggleVisibility(idx)}
                  className="w-4 h-4 ml-1 accent-red-600 cursor-pointer flex-shrink-0"
                />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sel.color }}
                ></div>
                {isEditing ? (
                  <input
                    type="text"
                    className="text-base border px-1 rounded w-full"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => handleLabelKeyDown(e, idx)}
                    autoFocus
                  />
                ) : (
                  <span className="truncate text-base">{sel.label}</span>
                )}
              </div>
              <div className="flex items-center ml-auto gap-1 mr-1">
                <Trash2
                  size={22}
                  color="#202020"
                  onClick={() => deleteSelection(idx)}
                  className="cursor-pointer flex-shrink-0"
                />
                {isEditing ? (
                  <Check
                    size={20}
                    color="#202020"
                    onClick={() => confirmEdit(idx)}
                    className="cursor-pointer flex-shrink-0"
                  />
                ) : (
                  <SquarePen
                    size={20}
                    color="#202020"
                    onClick={() => {
                      setEditingIndex(idx);
                      setNewLabel(sel.label);
                    }}
                    className="cursor-pointer flex-shrink-0"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PolygonPanel;
