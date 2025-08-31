export const config = { runtime: 'edge' };
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);

type Row = { country: string; count: number };

export default async function handler() {
  const { data, error } = await supabase
    .from('metrics_country')
    .select('country,count');
  if (error) {
    return new Response(JSON.stringify({ total: 0, countries: [], error: error.message }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
  const rows = (data as Row[]).sort((a, b) => b.count - a.count);
  const total = rows.reduce((s, r) => s + Number(r.count || 0), 0);

  return new Response(JSON.stringify({
    total,
    countries: rows.map(r => [r.country, Number(r.count)]),
    updatedAt: new Date().toISOString(),
  }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
}
