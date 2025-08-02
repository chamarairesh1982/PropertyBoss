import { useParams } from 'react-router-dom';
import { useAreaGuide } from '../hooks/useAreaGuide';

interface RouteParams {
  area: string;
}

export default function AreaGuidePage() {
  const { area } = useParams<RouteParams>();
  const { data, isLoading, error } = useAreaGuide(area ?? null);

  if (isLoading) {
    return <p className="p-4">Loading area guide…</p>;
  }
  if (error || !data) {
    return <p className="p-4 text-red-600">Failed to load area guide.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">{area} area guide</h2>
      <p className="text-lg">
        Average price:{' '}
        {data.averagePrice ? `£${data.averagePrice.toLocaleString()}` : 'N/A'}
      </p>
      <div>
        <h3 className="font-semibold mt-4">Demographics</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify(data.demographics, null, 2)}
        </pre>
      </div>
      {data.amenities.length > 0 && (
        <div>
          <h3 className="font-semibold mt-4">Amenities</h3>
          <ul className="list-disc list-inside">
            {data.amenities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
