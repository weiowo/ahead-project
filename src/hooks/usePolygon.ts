import { useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { DataPoint, PolygonSelection, PlotId } from '@/types/types';

interface UsePolygonProps {
  data: DataPoint[];
  xA: d3.ScaleLinear<number, number>;
  yA: d3.ScaleLinear<number, number>;
  xB: d3.ScaleLinear<number, number>;
  yB: d3.ScaleLinear<number, number>;
  setSelections: React.Dispatch<React.SetStateAction<PolygonSelection[]>>;
  selections: PolygonSelection[];
}

const THRESHOLD = 10;

const usePolygon = ({
  data,
  xA,
  yA,
  xB,
  yB,
  setSelections,
  selections,
}: UsePolygonProps) => {
  const [drawing, setDrawing] = useState<[number, number][]>([]);
  const [activePlot, setActivePlot] = useState<PlotId>('A');
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const colors = useMemo(() => {
    return [
      ...d3.schemeCategory10.filter((color) => color !== '#7f7f7f'),
      ...d3.schemeTableau10,
    ];
  }, []);

  const validateLabel = (label: string, existing: string[]) => {
    const trimmed = label.trim();
    const isValid = /^[a-zA-Z0-9\-\_\(\)\+\'\&\.\s]+$/.test(trimmed); // <-- added \s for spaces
    const isDuplicate = existing.includes(trimmed);
    return isValid && !isDuplicate ? trimmed : null;
  };

  const askForLabel = useCallback((existing: string[]): string => {
    while (true) {
      const input = prompt('Please enter label name (for example: CD45-, Gr, Mo, Ly):');
      if (input === null) return `Group${existing.length + 1}`;

      const valid = validateLabel(input, existing);
      if (valid) return valid;

      alert('Label can only contain letters, numbers, hyphens, and should not duplicate.');
    }
  }, []);

  const closePolygon = useCallback(() => {
    if (!drawing.length) return;

    const polygon = [...drawing, drawing[0]];
    const indices = data
      .map((d, i) => {
        const px = activePlot === 'A' ? xA(d['CD45-KrO']) : xB(d['CD19-PB']);
        const py =
          activePlot === 'A' ? yA(d['SS INT LIN']) : yB(d['SS INT LIN']);
        return d3.polygonContains(polygon, [px, py]) ? i : -1;
      })
      .filter((i) => i !== -1);

    const existingLabels = selections.map((s) => s.label);
    const label = askForLabel(existingLabels);

    const polygonA = activePlot === 'A' ? polygon : [];
    const polygonB = activePlot === 'B' ? polygon : [];

    setSelections((prev) => [
      ...prev,
      {
        label,
        color: colors[prev.length % colors.length],
        polygonA,
        polygonB,
        indices,
        sourcePlot: activePlot,
        visible: true,
      },
    ]);

    setDrawing([]);
  }, [
    drawing,
    data,
    xA,
    yA,
    xB,
    yB,
    activePlot,
    setSelections,
    selections,
    askForLabel,
    colors,
  ]);

  const handleClick = useCallback(
    (x: number, y: number, plot: PlotId) => {
      if (!isDrawingMode) return;
      setActivePlot(plot);

      if (drawing.length === 0) {
        setDrawing([[x, y]]);
      } else {
        const first = drawing[0];
        const distance = Math.hypot(x - first[0], y - first[1]);

        if (drawing.length > 2 && distance < THRESHOLD) {
          setDrawing((prev) => [...prev, first]);
          setTimeout(() => {
            closePolygon();
          }, 0);
        } else {
          setDrawing((prev) => [...prev, [x, y]]);
        }
      }
    },
    [drawing, closePolygon, isDrawingMode],
  );

  return {
    drawing,
    activePlot,
    isDrawingMode,
    setIsDrawingMode,
    handleClick,
  };
};

export default usePolygon;
