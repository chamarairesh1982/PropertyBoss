interface DataPoint {
  x: string;
  y: number;
}

export default function LineChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.y));
  const min = Math.min(...data.map((d) => d.y));
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = max === min ? 50 : ((max - d.y) / (max - min)) * 100;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full h-32 text-blue-600">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}
