import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { DataPoint } from '@/types';

export default function useCsvData(path: string) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Papa.parse(path, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setData(results.data as DataPoint[]);
        setLoading(false);
      },
    });
  }, [path]);

  return { data, loading };
}
