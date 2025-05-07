import * as d3 from 'd3';

export const getActualScale = ({
  width,
  height,
  xScale,
  yScale,
  margin,
}: {
  width: number;
  height: number;
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
  margin: { top: number; right: number; bottom: number; left: number };
}) => {
  const actualXScale = d3.scaleLinear().domain(xScale.domain()).range([margin.left, width - margin.right]);
  const actualYScale = d3.scaleLinear().domain(yScale.domain()).range([height - margin.bottom, margin.top]);
  return { actualXScale, actualYScale };
};
