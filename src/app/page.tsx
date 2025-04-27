'use client';

import { useState } from 'react';
import * as d3 from 'd3';
import useCsvData from '@/hooks/useCsvData';
import usePolygon from '@/hooks/usePolygon';
import { PolygonSelection } from '@/types/types';
import PolygonToolButton from '@/components/PolygonToolButton';
import SelectionControls from '@/components/SelectionsControl';
import Loader from '@/components/Loader';
import CanvasPlot from '@/components/CanvasPlot';

export default function Home() {
  const { data, loading } = useCsvData('/CD45_pos.csv');
  const [selections, setSelections] = useState<PolygonSelection[]>([]);

  const width = 450,
    height = 450;
  const margin = { top: 10, right: 10, bottom: 40, left: 50 };

  const xA = d3
    .scaleLinear()
    .domain([200, 1000])
    .range([margin.left, width - margin.right]);
  const yA = d3
    .scaleLinear()
    .domain([0, 1000])
    .range([height - margin.bottom, margin.top]);
  const xB = d3
    .scaleLinear()
    .domain([0, 1000])
    .range([margin.left, width - margin.right]);
  const yB = d3
    .scaleLinear()
    .domain([0, 1000])
    .range([height - margin.bottom, margin.top]);

  const { drawing, activePlot, isDrawingMode, setIsDrawingMode, handleClick } =
    usePolygon({ data, xA, yA, xB, yB, setSelections, selections });

  if (loading) {
    return (
      <main className="min-h-screen flex justify-center items-center">
        <Loader />
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-[1280px] p-5 mx-auto flex flex-col justify-center">
      <div className="w-full flex flex-col gap-4 md:flex-row md:gap-0 justify-between items-center mb-5">
        <h1 className="text-xl md:text-3xl font-bold text-center">
          Medical Data Visualization & Analytics
        </h1>
        <PolygonToolButton
          isDrawingMode={isDrawingMode}
          setIsDrawingMode={setIsDrawingMode}
          text="Arbitrary Polygon"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-10">
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Plot A</h2>
          <CanvasPlot
            data={data}
            selections={selections}
            drawing={drawing}
            activePlot={activePlot}
            plotId="A"
            xScale={xA}
            yScale={yA}
            fieldX="CD45-KrO"
            fieldY="SS INT LIN"
            handleClick={handleClick}
            isDrawingMode={isDrawingMode}
          />
        </div>
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Plot B</h2>
          <CanvasPlot
            data={data}
            selections={selections}
            drawing={drawing}
            activePlot={activePlot}
            plotId="B"
            xScale={xB}
            yScale={yB}
            fieldX="CD19-PB"
            fieldY="SS INT LIN"
            handleClick={handleClick}
            isDrawingMode={isDrawingMode}
          />
        </div>
      </div>
      <div className="mt-5">
        <SelectionControls
          selections={selections}
          setSelections={setSelections}
        />
      </div>
    </main>
  );
}
