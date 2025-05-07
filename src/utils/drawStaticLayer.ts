import * as d3 from 'd3';
import { DataPoint, PolygonSelection } from '@/types/types';
import { getActualScale } from './getActualScales';

export function drawStaticLayer({
  width,
  height,
  ratio,
  data,
  selections,
  xScale,
  yScale,
  fieldX,
  fieldY,
  margin,
}: {
  width: number;
  height: number;
  ratio: number;
  data: DataPoint[];
  selections: PolygonSelection[];
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  fieldX: keyof DataPoint;
  fieldY: keyof DataPoint;
  margin: { top: number; right: number; bottom: number; left: number };
}): HTMLCanvasElement {
  const buffer = document.createElement('canvas');
  buffer.width = width * ratio;
  buffer.height = height * ratio;

  const ctx = buffer.getContext('2d');
  if (!ctx) return buffer;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const { actualXScale, actualYScale } = getActualScale({ width, height, xScale, yScale, margin });

  ctx.strokeStyle = '#aaa';
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, height - margin.bottom);
  ctx.lineTo(width - margin.right, height - margin.bottom);
  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.font = `${Math.max(10, width / 40)}px sans-serif`;

  const xTicks = actualXScale.ticks(5);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  xTicks.forEach((tick) => {
    const x = actualXScale(tick);
    ctx.beginPath();
    ctx.moveTo(x, height - margin.bottom);
    ctx.lineTo(x, height - margin.bottom + 5);
    ctx.stroke();
    ctx.fillText(tick.toString(), x, height - margin.bottom + 6);
  });

  const yTicks = actualYScale.ticks(5);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
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
  ctx.fillText(fieldX.toString(), width / 2, height - 10);

  const selectedIndices = new Set(
    selections.flatMap((s) => (s.visible !== false ? s.indices : []))
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

  return buffer;
}
