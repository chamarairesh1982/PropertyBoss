import { serve } from '../deno_std_http_server.ts';
import { createClient } from '../supabase_client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function incrementAttempt(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  event: string,
  limit: number,
  windowMs: number,
): Promise<{ blocked: boolean }> {
  const { data } = await supabase
    .from('rate_limits')
    .select('count,last_request')
    .eq('identifier', identifier)
    .eq('event', event)
    .maybeSingle();
  const now = Date.now();
  const recent = data && new Date(data.last_request).getTime() > now - windowMs;
  const count = recent ? data!.count : 0;
  if (recent && count >= limit) {
    return { blocked: true };
  }
  await supabase.from('rate_limits').upsert({
    identifier,
    event,
    count: count + 1,
    last_request: new Date().toISOString(),
  });
  return { blocked: false };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const { email, password } = (await req.json()) as {
    email: string;
    password: string;
  };
  const identifier =
    req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip') ??
    'unknown';

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const rate = await incrementAttempt(
    serviceClient,
    identifier,
    'login',
    5,
    60_000,
  );
  if (rate.blocked) {
    return new Response(
      JSON.stringify({ error: 'Too many login attempts' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    );
  }

  const anon = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return new Response(JSON.stringify({ error: error?.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
  return new Response(JSON.stringify({ session: data.session }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});
