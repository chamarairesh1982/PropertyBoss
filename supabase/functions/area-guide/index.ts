import { serve } from '../deno_std_http_server.ts';
import { createClient } from '../supabase_client.ts';

interface RequestBody {
  area: string;
}

function corsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      req.headers.get('access-control-request-headers') ??
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  } as Record<string, string>;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }
  const { area } = (await req.json()) as RequestBody;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: cached } = await supabase
    .from('area_guides')
    .select('data, updated_at')
    .eq('area', area)
    .maybeSingle();

  if (
    cached &&
    new Date().getTime() - new Date(cached.updated_at as string).getTime() <
      1000 * 60 * 60 * 24
  ) {
    return new Response(JSON.stringify(cached.data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
    });
  }

  const postcodeRes = await fetch(
    `https://api.postcodes.io/outcodes/${encodeURIComponent(area)}`,
  );
  const postcodeData = await postcodeRes.json();
  const info = postcodeData?.result;
  const lat = info?.latitude;
  const lon = info?.longitude;
  const onsCode = info?.codes?.laua as string | undefined;

  let averagePrice: number | null = null;
  let population: number | null = null;

  if (onsCode) {
    const priceRes = await fetch(
      `https://api.beta.ons.gov.uk/v1/datasets/UKHPI/editions/time-series/versions/1/observations?time=latest&geography=${onsCode}`,
    );
    const priceData = await priceRes.json();
    averagePrice = Number(priceData?.observations?.[0]?.value ?? null);

    const popRes = await fetch(
      `https://api.beta.ons.gov.uk/v1/datasets/MYE2/editions/time-series/versions/1/observations?time=latest&geography=${onsCode}&sex=0&age=ALL`,
    );
    const popData = await popRes.json();
    population = Number(popData?.observations?.[0]?.value ?? null);
  }

  let amenities: string[] = [];
  if (lat != null && lon != null) {
    const query =
      `[out:json];(node(around:1000,${lat},${lon})[amenity];);out;`;
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    const data = (await res.json()) as {
      elements: { tags?: { name?: string } }[];
    };
    amenities = data.elements
      .map((el) => el.tags?.name)
      .filter((n): n is string => Boolean(n))
      .slice(0, 10);
  }

  const result = {
    averagePrice,
    demographics: { population, region: info?.region },
    amenities,
  };

  await supabase
    .from('area_guides')
    .upsert({ area, data: result, updated_at: new Date().toISOString() });

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) },
  });
});
