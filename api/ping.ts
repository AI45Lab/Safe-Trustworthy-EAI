export const config = { runtime: 'edge' };
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);

export default async function handler(req: Request) {
  const country = req.headers.get('x-vercel-ip-country') || 'UNKNOWN';
  await supabase.rpc('inc_country', { c: country });
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' }
  });
}
