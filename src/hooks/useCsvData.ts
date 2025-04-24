import { useEffect, useState } from 'react';
import Papa from 'papaparse';

export interface CellData {
  'CD45-KrO': number;
  'CD19-PB': number;
  'SS INT LIN': number;
}

export default function useCsvData(path: string) {
  const [data, setData] = useState<CellData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setData(results.data as CellData[]);
        setLoading(false);
      },
    });
  }, [path]);

  return { data, loading };
}
