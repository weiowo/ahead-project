import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { DataPoint, PolygonSelection, PlotId } from '@/types/types';

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

  const margin = React.useMemo(
    () => ({ top: 10, right: 10, bottom: 40, left: 50 }),
    [],
  );

  const setCanvasSize = React.useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        canvas.style.width = `${dimensions.width}px`;
        canvas.style.height = `${dimensions.height}px`;
        ctx.scale(dpr, dpr);
      }
    },
    [dimensions],
  );

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const newWidth = Math.min(width, 450);
        const newHeight = newWidth;
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);

    const actualXScale = d3
      .scaleLinear()
      .domain(xScale.domain())
      .range([margin.left, width - margin.right]);

    const actualYScale = d3
      .scaleLinear()
      .domain(yScale.domain())
      .range([height - margin.bottom, margin.top]);

    ctx.strokeStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = `${Math.max(10, width / 40)}px sans-serif`;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xTicks = actualXScale.ticks(5);
    xTicks.forEach((tick) => {
      const x = actualXScale(tick);
      ctx.beginPath();
      ctx.moveTo(x, height - margin.bottom);
      ctx.lineTo(x, height - margin.bottom + 5);
      ctx.stroke();
      ctx.fillText(tick.toString(), x, height - margin.bottom + 6);
    });

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yTicks = actualYScale.ticks(5);
    yTicks.forEach((tick) => {
      const y = actualYScale(tick);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left - 5, y);
      ctx.stroke();
      ctx.fillText(tick.toString(), margin.left - 8, y);
    });

    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(fieldY.toString(), 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillText(fieldX.toString(), width / 2, height - 10);

    const selectedIndices = new Set(
      selections
        .filter((sel) => sel.visible !== false)
        .flatMap((sel) => sel.indices),
    );

    ctx.fillStyle = 'gray';
    data.forEach((d, i) => {
      if (selectedIndices.has(i)) return;
      const x = actualXScale(d[fieldX] as number);
      const y = actualYScale(d[fieldY] as number);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, width / 400), 0, 2 * Math.PI);
      ctx.fill();
    });

    selections.forEach((sel) => {
      if (sel.visible === false) return;
      ctx.fillStyle = sel.color;
      sel.indices.forEach((i) => {
        const d = data[i];
        const x = actualXScale(d[fieldX] as number);
        const y = actualYScale(d[fieldY] as number);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, width / 400), 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    selections.forEach((sel) => {
      if (sel.visible === false) return;

      const polygonPoints = plotId === 'A' ? sel.polygonA : sel.polygonB;
      if (!polygonPoints || polygonPoints.length === 0) return;

      const currentPolygonPoints = polygonPoints.map(([x, y]) => {
        const prevWidth = 450;
        const prevHeight = 450;
        const prevXScale = d3
          .scaleLinear()
          .domain(xScale.domain())
          .range([margin.left, prevWidth - margin.right]);
        const prevYScale = d3
          .scaleLinear()
          .domain(yScale.domain())
          .range([prevHeight - margin.bottom, margin.top]);
        const dataX = prevXScale.invert(x);
        const dataY = prevYScale.invert(y);
        return [actualXScale(dataX), actualYScale(dataY)];
      });

      ctx.strokeStyle = sel.color;
      ctx.lineWidth = Math.max(1, width / 250);
      ctx.beginPath();

      currentPolygonPoints.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.closePath();
      ctx.stroke();
    });

    selections.forEach((sel) => {
      if (sel.visible === false) return;

      const polygonPoints = plotId === 'A' ? sel.polygonA : sel.polygonB;
      if (!polygonPoints || polygonPoints.length === 0) return;

      const currentPolygonPoints = polygonPoints.map(([x, y]) => {
        const prevWidth = 450;
        const prevHeight = 450;
        const prevXScale = d3
          .scaleLinear()
          .domain(xScale.domain())
          .range([margin.left, prevWidth - margin.right]);
        const prevYScale = d3
          .scaleLinear()
          .domain(yScale.domain())
          .range([prevHeight - margin.bottom, margin.top]);

        const dataX = prevXScale.invert(x);
        const dataY = prevYScale.invert(y);

        return [actualXScale(dataX), actualYScale(dataY)];
      });

      const cx =
        currentPolygonPoints.reduce((sum, p) => sum + p[0], 0) /
        currentPolygonPoints.length;
      const cy =
        currentPolygonPoints.reduce((sum, p) => sum + p[1], 0) /
        currentPolygonPoints.length;
      ctx.font = `bold ${Math.max(12, width / 25)}px sans-serif`;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = Math.max(3, width / 120);
      ctx.strokeText(sel.label, cx, cy);
      ctx.fillStyle = sel.color;
      ctx.fillText(sel.label, cx, cy);
    });

    if (drawing.length > 1 && activePlot === plotId) {
      ctx.strokeStyle = 'black';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = Math.max(1, width / 250);
      ctx.beginPath();

      drawing.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    data,
    selections,
    drawing,
    activePlot,
    plotId,
    xScale,
    yScale,
    fieldX,
    fieldY,
    dimensions,
    margin,
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasSize(canvasRef.current);
      drawCanvas();
    }
  }, [
    dimensions,
    data,
    selections,
    drawing,
    xScale,
    yScale,
    fieldX,
    fieldY,
    activePlot,
    isDrawingMode,
    drawCanvas,
    setCanvasSize,
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
        className={`${isDrawingMode ? 'cursor-crosshair' : ''} w-full h-auto rounded`}
      />
    </div>
  );
};

export default CanvasPlot;
