import { serve } from '../deno_std_http_server.ts';
import { createClient } from '../supabase_client.ts';

serve(async (req: Request) => {
  const { lat, lon } = (await req.json()) as { lat: number; lon: number };

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const latKey = Math.round(lat * 1000) / 1000;
  const lonKey = Math.round(lon * 1000) / 1000;

  const { data: cached } = await supabase
    .from('nearby_cache')
    .select('results')
    .eq('lat', latKey)
    .eq('lon', lonKey)
    .maybeSingle();

  if (cached) {
    return new Response(JSON.stringify({ results: cached.results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const query =
    `[out:json];(node(around:1000,${lat},${lon})[amenity~"(school|hospital|pharmacy|restaurant|cafe|pub|bar|supermarket|bank)"];);out;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });
  const data = (await res.json()) as {
    elements: { tags?: { name?: string } }[];
  };
  const results = data.elements
    .map((el: { tags?: { name?: string } }) => el.tags?.name)
    .filter((n: string | undefined): n is string => Boolean(n));

  await supabase.from('nearby_cache').upsert({
    lat: latKey,
    lon: lonKey,
    results,
    created_at: new Date().toISOString(),
  });

  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
