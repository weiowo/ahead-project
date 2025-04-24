import { useState, useCallback } from 'react';
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
const colors = d3.schemeCategory10;

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

  const closePolygon = useCallback(() => {
    if (!drawing.length) return;

    const polygon = [...drawing, drawing[0]];

    const indices = data
      .map((d, i) => {
        let px, py;

        if (activePlot === 'A') {
          px = xA(d['CD45-KrO']);
          py = yA(d['SS INT LIN']);
        } else {
          px = xB(d['CD19-PB']);
          py = yB(d['SS INT LIN']);
        }

        return d3.polygonContains(polygon, [px, py]) ? i : -1;
      })
      .filter((i) => i !== -1);

    const label =
      prompt('輸入標籤名稱 (如 CD45-, Gr, Mo, Ly):') ||
      `Group${selections?.length + 1}`;

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
    selections?.length,
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
