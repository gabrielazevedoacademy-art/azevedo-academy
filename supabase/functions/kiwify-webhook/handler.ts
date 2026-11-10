// Lógica do webhook da Kiwify, separada do servidor para poder ser testada.

export type Db = {
  findCourseByProduct(productId: string): Promise<{ id: string } | null>;
  upsertPurchase(row: Record<string, unknown>): Promise<void>;
  findProfileByEmail(email: string): Promise<{ id: string } | null>;
  grant(userId: string, courseId: string): Promise<void>;
  revokeIfNoOtherPaid(userId: string, courseId: string, email: string, orderId: string): Promise<void>;
};

const enc = new TextEncoder();

export async function hmacSha1Hex(key: string, body: string) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(body)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Os campos de produto e cliente aparecem com inicial maiúscula no payload da Kiwify; aceitamos as duas formas.
function pick(obj: Record<string, any>, ...keys: string[]) {
  for (const k of keys) if (obj?.[k] != null) return obj[k];
  return undefined;
}

export function parseEvent(payload: Record<string, any>) {
  const product = pick(payload, 'Product', 'product') ?? {};
  const customer = pick(payload, 'Customer', 'customer') ?? {};
  return {
    orderId: String(payload.order_id ?? ''),
    status: String(payload.order_status ?? ''),
    event: String(payload.webhook_event_type ?? ''),
    productId: pick(product, 'product_id', 'id') ? String(pick(product, 'product_id', 'id')) : null,
    email: String(pick(customer, 'email') ?? '').trim().toLowerCase(),
    name: pick(customer, 'full_name', 'name') ? String(pick(customer, 'full_name', 'name')) : null
  };
}

export async function handle(req: { body: string; signature: string | null; token: string }, db: Db) {
  if (!req.token) return { status: 500, body: 'token not configured' };
  const expected = await hmacSha1Hex(req.token, req.body);
  if (!req.signature || !safeEqual(expected, req.signature.toLowerCase())) return { status: 401, body: 'invalid signature' };

  let payload: Record<string, any>;
  try {
    payload = JSON.parse(req.body);
  } catch {
    return { status: 400, body: 'invalid json' };
  }

  const e = parseEvent(payload);
  // Eventos sem pedido (ex.: carrinho abandonado) são apenas confirmados
  if (!e.orderId || !e.status) return { status: 200, body: 'ignored' };

  const course = e.productId ? await db.findCourseByProduct(e.productId) : null;

  if (e.email) {
    await db.upsertPurchase({
      provider: 'kiwify',
      order_id: e.orderId,
      status: e.status,
      email: e.email,
      customer_name: e.name,
      product_id: e.productId,
      course_id: course?.id ?? null,
      payload
    });
  }

  if (!course || !e.email) return { status: 200, body: 'recorded' };

  const profile = await db.findProfileByEmail(e.email);
  if (!profile) return { status: 200, body: 'recorded; access on signup' };

  if (e.status === 'paid') {
    await db.grant(profile.id, course.id);
    return { status: 200, body: 'granted' };
  }
  if (e.status === 'refunded' || e.status === 'chargedback') {
    await db.revokeIfNoOtherPaid(profile.id, course.id, e.email, e.orderId);
    return { status: 200, body: 'revoked' };
  }
  return { status: 200, body: 'recorded' };
}
