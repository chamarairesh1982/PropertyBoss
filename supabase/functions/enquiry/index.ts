import { serve } from '../deno_std_http_server.ts';
import { createClient } from '../supabase_client.ts';

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
  const { propertyId, senderId, receiverId, content } = (await req.json()) as {
    propertyId: string;
    senderId: string;
    receiverId: string;
    content: string;
  };

  const identifier = senderId ||
    req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') ||
    'unknown';

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const rate = await incrementAttempt(
    serviceClient,
    identifier,
    'enquiry',
    10,
    60_000,
  );
  if (rate.blocked) {
    return new Response(JSON.stringify({ error: 'Too many enquiries' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await serviceClient.from('messages').insert({
    property_id: propertyId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
