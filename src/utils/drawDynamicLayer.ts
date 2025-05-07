import * as d3 from 'd3';
import { DataPoint, PolygonSelection, PlotId } from '@/types/types';
import { getActualScale } from './getActualScales';

export function drawDynamicLayer({
  canvas,
  staticLayer,
  width,
  height,
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
}: {
  canvas: HTMLCanvasElement;
  staticLayer: HTMLCanvasElement;
  width: number;
  height: number;
  ratio: number;
  data: DataPoint[];
  selections: PolygonSelection[];
  drawing: [number, number][];
  activePlot: PlotId;
  plotId: PlotId;
  fieldX: keyof DataPoint;
  fieldY: keyof DataPoint;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  margin: { top: number; right: number; bottom: number; left: number };
}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(staticLayer, 0, 0, width, height);

  const { actualXScale, actualYScale } = getActualScale({
    width,
    height,
    xScale,
    yScale,
    margin,
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

    const polygon = plotId === 'A' ? sel.polygonA : sel.polygonB;
    if (!polygon?.length) return;

    const prevX = d3
      .scaleLinear()
      .domain(xScale.domain())
      .range([margin.left, 450 - margin.right]);
    const prevY = d3
      .scaleLinear()
      .domain(yScale.domain())
      .range([450 - margin.bottom, margin.top]);
    const scaled = polygon.map(([x, y]) => {
      const dataX = prevX.invert(x);
      const dataY = prevY.invert(y);
      return [actualXScale(dataX), actualYScale(dataY)] as [number, number];
    });

    ctx.strokeStyle = sel.color;
    ctx.lineWidth = Math.max(1, width / 250);
    ctx.beginPath();
    scaled.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();

    const cx = scaled.reduce((sum, p) => sum + p[0], 0) / scaled.length;
    const cy = scaled.reduce((sum, p) => sum + p[1], 0) / scaled.length;
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
}
