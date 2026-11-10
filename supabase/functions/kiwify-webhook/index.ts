// Webhook da Kiwify → libera ou remove o acesso ao curso.
// URL: https://<projeto>.supabase.co/functions/v1/kiwify-webhook
// Segredo necessário: KIWIFY_WEBHOOK_TOKEN (o token mostrado no webhook cadastrado na Kiwify).
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handle, type Db } from './handler.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const db: Db = {
  async findCourseByProduct(productId) {
    const { data } = await supabase.from('courses').select('id').eq('kiwify_product_id', productId).maybeSingle();
    return data;
  },
  async upsertPurchase(row) {
    const { error } = await supabase.from('purchases').upsert(row, { onConflict: 'provider,order_id' });
    if (error) throw error;
  },
  async findProfileByEmail(email) {
    const { data } = await supabase.from('profiles').select('id').ilike('email', email).limit(1).maybeSingle();
    return data;
  },
  async grant(userId, courseId) {
    const { error } = await supabase
      .from('enrollments')
      .upsert({ user_id: userId, course_id: courseId, source: 'kiwify', expires_at: null }, { onConflict: 'user_id,course_id' });
    if (error) throw error;
  },
  async revokeIfNoOtherPaid(userId, courseId, email, orderId) {
    const { count } = await supabase
      .from('purchases')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .ilike('email', email)
      .eq('status', 'paid')
      .neq('order_id', orderId);
    if (count) return;
    // Só remove acessos que vieram da Kiwify; liberações manuais do admin são mantidas.
    await supabase.from('enrollments').delete().eq('user_id', userId).eq('course_id', courseId).eq('source', 'kiwify');
  }
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  try {
    const url = new URL(req.url);
    const result = await handle(
      { body: await req.text(), signature: url.searchParams.get('signature'), token: Deno.env.get('KIWIFY_WEBHOOK_TOKEN') ?? '' },
      db
    );
    return new Response(result.body, { status: result.status });
  } catch (err) {
    console.error('kiwify-webhook', err);
    return new Response('error', { status: 500 });
  }
});
