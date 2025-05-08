export interface PolygonSelection {
  label: string;
  color: string;
  polygonA: [number, number][];
  polygonB: [number, number][];
  indices: number[];
  sourcePlot: 'A' | 'B';
  visible?: boolean;
}

export interface DataPoint {
  'CD45-KrO': number;
  'SS INT LIN': number;
  'CD19-PB': number;
}

export type PlotId = 'A' | 'B';
