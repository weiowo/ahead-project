import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PolygonSelection, DataPoint, PlotId } from '@/types/types';

interface PlotProps {
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

const sanitizeLabel = (label: string) =>
  'label-' + btoa(label).replace(/[^a-zA-Z0-9]/g, '_');

const Plot = ({
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
}: PlotProps) => {
  const plotRef = useRef<SVGSVGElement>(null);

  const calculatePolygonCentroid = (polygon: [number, number][]) => {
    if (polygon.length === 0) return [0, 0];
    const sumX = polygon.reduce((sum, [x]) => sum + x, 0);
    const sumY = polygon.reduce((sum, [, y]) => sum + y, 0);
    return [sumX / polygon.length, sumY / polygon.length];
  };

  useEffect(() => {
    if (!data.length) return;

    const activeIndices = new Set<number>(
      selections
        .filter((sel) => sel.visible !== false)
        .flatMap((sel) => sel.indices),
    );

    const margin = { top: 10, right: 10, bottom: 40, left: 50 };
    const width = 500;
    const height = 500;

    const drawPlot = (
      svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
      xScale: d3.ScaleLinear<number, number>,
      yScale: d3.ScaleLinear<number, number>,
      fieldX: keyof DataPoint,
      fieldY: keyof DataPoint,
      plotId: PlotId,
    ) => {
      svg.selectAll('*').remove();

      svg
        .append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

      svg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom + 35)
        .text(plotId === 'A' ? 'CD45-KrO' : 'CD19-PB');

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left - 35)
        .text('SS INT LIN');

      const dotsContainer = svg.append('g');

      dotsContainer
        .selectAll('.unselected-dots')
        .data(data.filter((_, i) => !activeIndices.has(i)))
        .join('circle')
        .attr('class', 'unselected-dots')
        .attr('cx', (d) => xScale(d[fieldX]))
        .attr('cy', (d) => yScale(d[fieldY]))
        .attr('r', 1.5)
        .attr('fill', 'gray');

      selections.forEach((sel) => {
        if (sel.visible === false) return;

        const polygonToUse = plotId === 'A' ? sel.polygonA : sel.polygonB;
        if (polygonToUse.length > 0) {
          svg
            .append('path')
            .attr('d', d3.line()(polygonToUse) + 'Z')
            .attr('fill', sel.color)
            .attr('fill-opacity', 0.05)
            .attr('stroke', sel.color)
            .attr('stroke-width', 2.5);

          const [centroidX, centroidY] = calculatePolygonCentroid(polygonToUse);
          svg
            .append('text')
            .attr('x', centroidX)
            .attr('y', centroidY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '24px')
            .attr('font-weight', 'bold')
            .attr('fill', sel.color)
            .attr('stroke', 'white')
            .attr('stroke-width', 3)
            .attr('paint-order', 'stroke')
            .text(sel.label);
        }
      });

      selections.forEach((sel) => {
        if (sel.visible === false) return;
        const className = `selected-dots-${sanitizeLabel(sel.label)}`;
        dotsContainer
          .selectAll(`.${className}`)
          .data(data.filter((_, i) => sel.indices.includes(i)))
          .join('circle')
          .attr('class', className)
          .attr('cx', (d) => xScale(d[fieldX]))
          .attr('cy', (d) => yScale(d[fieldY]))
          .attr('r', 1.5)
          .attr('fill', sel.color);
      });

      if (drawing.length > 1 && activePlot === plotId) {
        svg
          .append('path')
          .attr('d', d3.line()(drawing))
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '4');
      }

      svg.on('click', (event) => {
        if (!isDrawingMode) return;
        const [mx, my] = d3.pointer(event);
        handleClick(mx, my, plotId);
      });

      svg.on('contextmenu', (event) => {
        event.preventDefault();
      });
    };

    drawPlot(
      d3.select(plotRef.current),
      xScale,
      yScale,
      fieldX,
      fieldY,
      plotId,
    );
  }, [
    data,
    selections,
    drawing,
    xScale,
    yScale,
    fieldX,
    fieldY,
    handleClick,
    activePlot,
    isDrawingMode,
    plotId,
  ]);

  return (
    <svg
      ref={plotRef}
      width={500}
      height={500}
      className={`${isDrawingMode ? 'cursor-crosshair' : ''}`}
    />
  );
};

export default Plot;
