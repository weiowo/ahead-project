import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { DataPoint, PolygonSelection, PlotId } from '@/types';
import { drawStaticLayer } from '@/utils/drawStaticLayer';
import { drawDynamicLayer } from '@/utils/drawDynamicLayer';
import cn from '@/utils/cn';

interface CanvasPlotProps {
  data: DataPoint[];
  selections: PolygonSelection[];
  drawing: [number, number][];
  activePlot: PlotId;
  plotId: PlotId;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  fieldX: keyof DataPoint;
  fieldY: keyof DataPoint;
  handleClick: (x: number, y: number, plot: PlotId) => void;
  isDrawingMode: boolean;
}

const CanvasPlot = ({
  data,
  selections,
  drawing,
  activePlot,
  plotId,
  xScale,
  yScale,
  fieldX,
  fieldY,
  handleClick,
  isDrawingMode,
}: CanvasPlotProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 450, height: 450 });
  const staticLayerRef = useRef<HTMLCanvasElement | null>(null);

  const ratio =
    typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const margin = React.useMemo(
    () => ({ top: 10, right: 10, bottom: 40, left: 50 }),
    [],
  );

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const newSize = Math.min(width, 450);
        setDimensions({ width: newSize, height: newSize });
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    staticLayerRef.current = drawStaticLayer({
      width: dimensions.width,
      height: dimensions.height,
      ratio,
      data,
      selections,
      xScale,
      yScale,
      fieldX,
      fieldY,
      margin,
    });
  }, [
    data,
    selections,
    dimensions,
    ratio,
    xScale,
    yScale,
    fieldX,
    fieldY,
    margin,
  ]);

  useEffect(() => {
    if (!canvasRef.current || !staticLayerRef.current) return;
    drawDynamicLayer({
      canvas: canvasRef.current,
      staticLayer: staticLayerRef.current,
      width: dimensions.width,
      height: dimensions.height,
      ratio,
      data,
      selections,
      drawing,
      activePlot,
      plotId,
      fieldX,
      fieldY,
      xScale,
      yScale,
      margin,
    });
  }, [
    data,
    selections,
    drawing,
    activePlot,
    plotId,
    dimensions,
    ratio,
    xScale,
    yScale,
    fieldX,
    fieldY,
    margin,
  ]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!isDrawingMode) return;
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    handleClick(mx, my, plotId);
  };

  return (
    <div ref={containerRef} className="w-full max-w-[450px] mx-auto">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          'w-full h-auto rounded',
          isDrawingMode ? 'cursor-crosshair' : '',
        )}
        width={dimensions.width * ratio}
        height={dimensions.height * ratio}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      />
    </div>
  );
};

export default CanvasPlot;
