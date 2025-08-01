import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { lat, lon } = await req.json();
  const query = `[out:json];(node(around:1000,${lat},${lon})[amenity=school];);out;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  const data = await res.json() as { elements: { tags?: { name?: string } }[] };
  const results = data.elements
    .map((el) => el.tags?.name)
    .filter((n): n is string => Boolean(n));
  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
