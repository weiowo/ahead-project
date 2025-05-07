'use client';

import { useState } from 'react';
import * as d3 from 'd3';
import useCsvData from '@/hooks/useCsvData';
import usePolygon from '@/hooks/usePolygon';
import { PolygonSelection } from '@/types/types';
import SelectionControls from '@/components/PolygonPanel';
import Loader from '@/components/Loader';
import CanvasPlot from '@/components/CanvasPlot';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const { data, loading } = useCsvData('/CD45_pos.csv');
  const [selections, setSelections] = useState<PolygonSelection[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    <main className="min-h-screen max-w-[1400px] p-4 mx-auto flex flex-col justify-center relative overflow-x-hidden">
      <div className="w-full flex justify-between items-center mb-5">
        <h1 className="text-xl md:text-3xl font-bold text-center flex-1">
          Medical Data Visualization & Analytics
        </h1>
        <div className="xl:hidden ml-4">
          <Menu
            size={28}
            className="cursor-pointer"
            onClick={() => setIsDrawerOpen(true)}
          />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-2">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 flex-1">
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
        <div className="hidden xl:block w-[280px] flex-shrink-0">
          <SelectionControls
            selections={selections}
            setSelections={setSelections}
            isDrawingMode={isDrawingMode}
            setIsDrawingMode={setIsDrawingMode}
          />
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        } xl:hidden`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Arbitrary Polygon Panel</h2>
          <X
            size={28}
            onClick={() => setIsDrawerOpen(false)}
            className="text-sm cursor-pointer"
          />
        </div>
        <div className="p-2 overflow-y-auto">
          <SelectionControls
            selections={selections}
            setSelections={setSelections}
            isDrawingMode={isDrawingMode}
            setIsDrawingMode={setIsDrawingMode}
          />
        </div>
      </div>
    </main>
  );
}
