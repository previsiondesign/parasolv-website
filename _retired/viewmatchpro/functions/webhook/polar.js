// Cloudflare Pages Function — Polar -> keygen bridge.
// Route: POST https://viewmatchpro.com/webhook/polar
//
// Two purchase paths, deliberately kept separate:
//
// 1. AUTO-RENEWING SUBSCRIPTION. ONE subscription = ONE keygen license. Polar
//    fires several near-simultaneous events per subscription, so to avoid
//    duplicates only `subscription.active` creates the license (and emails the
//    key); `subscription.updated` extends its expiry on renewal;
//    `subscription.revoked` expires it. Keyed by metadata.polarSub.
//
// 2. FIXED-TERM, NON-RENEWING. A one-time Polar product that grants
//    FIXED_TERM_MONTHS of access and then simply lapses — nothing recurs.
//    Fulfilled from `order.paid`, keyed by metadata.polarOrder.
//
// The order.* branches MUST stay guarded on billing_reason === 'purchase'.
// Polar also emits order.paid for subscription_create / subscription_cycle /
// subscription_update, and acting on those here would mint a second license
// on every single renewal. test/webhook_test.mjs locks that behavior down.
//
// Cloudflare env (Production): POLAR_WEBHOOK_SECRET, KEYGEN_ACCOUNT_ID,
// KEYGEN_POLICY_ID, KEYGEN_TOKEN, RESEND_API_KEY. Optional: RENEW_URL (buy
// link in the fixed-term email); OWNER_EMAIL (churn alerts on cancellation).

// One-time (non-renewing) products, by Polar product id -> term length in
// months. A one-time order for a product NOT listed here is ignored, so adding
// a future one-time SKU (a different term, a lifetime key) can never be
// silently fulfilled as a 1-month license until it is deliberately mapped.
const FIXED_TERM_PRODUCTS = {
  'ad6b8862-1f8d-478f-8beb-cb612c7f8772': 1,  // Parasolv Match - One Month ($59), Berm Labs org
};

// TODO(rebrand): flips to 'Parasolv Match' when the plugin UI sweep lands.
// Kept matching the shipped plugin so the email names what the buyer installs.
// The from: address must stay @viewmatchpro.com (that domain is Resend-verified).
const PRODUCT = 'ViewMatch Pro';

export async function onRequestPost(context) {
  const { request, env } = context;
  const raw = await request.text();

  if (!(await verifySignature(raw, request.headers, env.POLAR_WEBHOOK_SECRET)))
    return new Response('invalid signature', { status: 401 });

  let event;
  try { event = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }

  const type      = event.type || '';
  const d         = event.data || {};
  const subId     = d.id;                                  // subscription id (subscription.* events)
  const email     = d.customer?.email || d.user?.email;
  const periodEnd = d.current_period_end || d.ends_at || null;

  // True only for a standalone one-time purchase. Subscription-generated orders
  // carry subscription_create / subscription_cycle / subscription_update and are
  // owned by the subscription.* branches.
  const isOneTimeOrder = d.billing_reason === 'purchase' && !d.subscription_id;

  try {
    if (type === 'subscription.active') {
      // Sole creator. Create if no license exists for this subscription yet,
      // otherwise just refresh expiry (covers retries). Email only on create.
      const lic = await findByMeta(env, 'polarSub', subId);
      if (lic) {
        await setExpiry(env, lic.id, periodEnd);
      } else if (email) {
        const created = await createLicense(env, { polarSub: subId }, email, periodEnd);
        if (created?.key) await emailKey(env, email, created.key);
      }
    } else if (type === 'subscription.updated') {
      const lic = await findByMeta(env, 'polarSub', subId); // renewal: extend only, never create
      if (lic) await setExpiry(env, lic.id, periodEnd);
    } else if (type === 'subscription.revoked') {
      const lic = await findByMeta(env, 'polarSub', subId); // refund / hard end -> cut access now
      if (lic) await setExpiry(env, lic.id, new Date().toISOString());
    } else if (type === 'order.paid' && isOneTimeOrder) {
      // Fixed-term purchase. Nothing renews it; the license just lapses.
      // Only fulfil products we've mapped a term for; ignore anything else.
      const productId = d.product_id || d.product?.id || d.items?.[0]?.product_id;
      const months    = FIXED_TERM_PRODUCTS[productId];
      if (months) {
        const orderId = d.id;
        const lic = await findByMeta(env, 'polarOrder', orderId);
        if (!lic && email) {                               // absent => first delivery; retries no-op
          const expiry  = addMonthsIso(d.created_at, months);
          const created = await createLicense(env, { polarOrder: orderId }, email, expiry);
          if (created?.key) await emailFixedTermKey(env, email, created.key, expiry);
        }
      }
    } else if (type === 'order.refunded' && isOneTimeOrder) {
      const lic = await findByMeta(env, 'polarOrder', d.id);
      if (lic) await setExpiry(env, lic.id, new Date().toISOString());
    } else if (type === 'subscription.canceled') {
      // Fires once, immediately, carrying the reason/comment the customer gave.
      // Access still runs to subscription.revoked at period end, so this only
      // alerts the owner -- it changes no license.
      await notifyOwnerCancellation(env, d);
    }
    // subscription.created is intentionally ignored: active creates, updated
    // renews, revoked cuts access at period end.
    return new Response('ok', { status: 200 });
  } catch (e) {
    return new Response('error: ' + e.message, { status: 500 });
  }
}

/* ----------------------------- signature ------------------------------ */
// Standard Webhooks (webhook-id/-timestamp/-signature). Polar's secret is
// "polar_whs_<base64>"; we try the plausible key interpretations and accept any.
async function verifySignature(body, headers, secret) {
  try {
    if (!secret) return false;
    const id = headers.get('webhook-id');
    const ts = headers.get('webhook-timestamp');
    const sigHeader = headers.get('webhook-signature');
    if (!id || !ts || !sigHeader) return false;

    const norm = s => (s || '').replace(/=+$/, '');                 // ignore base64 padding diffs
    const received = sigHeader.split(' ').map(p => norm(p.includes(',') ? p.split(',')[1] : p));
    const signed = `${id}.${ts}.${body}`;
    const enc = new TextEncoder();

    let after = secret;
    if (secret.startsWith('polar_whs_'))  after = secret.slice(10);
    else if (secret.startsWith('whsec_')) after = secret.slice(6);

    const keys = [];
    try { keys.push(b64ToBytes(after)); } catch (_e) {}  // base64-decoded (spec)
    keys.push(enc.encode(after));                         // raw secret w/o prefix
    keys.push(enc.encode(secret));                        // raw full secret

    for (const keyBytes of keys) {
      const ck = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const mac = await crypto.subtle.sign('HMAC', ck, enc.encode(signed));
      const exp = norm(bytesToB64(new Uint8Array(mac)));
      if (received.some(r => timingSafeEqual(r, exp))) return true;
    }
    return false;
  } catch (_e) {
    return false; // fail closed (401), never 500
  }
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function b64ToBytes(b64) {
  b64 = b64.replace(/-/g, '+').replace(/_/g, '/'); // tolerate base64url
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64(bytes) {
  let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/* ----------------------------- keygen --------------------------------- */
const KG = (env) => `https://api.keygen.sh/v1/accounts/${env.KEYGEN_ACCOUNT_ID}`;
const kgHeaders = (env) => ({
  'Authorization': `Bearer ${env.KEYGEN_TOKEN}`,
  'Content-Type': 'application/vnd.api+json',
  'Accept': 'application/vnd.api+json',
});

async function findByMeta(env, key, val) {
  if (!val) return null;
  const r = await fetch(`${KG(env)}/licenses?metadata[${key}]=${encodeURIComponent(val)}&limit=1`,
    { headers: kgHeaders(env) });
  const j = await r.json().catch(() => ({}));
  return j?.data?.[0] || null;
}

async function createLicense(env, meta, email, expiryIso) {
  const r = await fetch(`${KG(env)}/licenses`, {
    method: 'POST', headers: kgHeaders(env),
    body: JSON.stringify({
      data: {
        type: 'licenses',
        attributes: { expiry: expiryIso || null, metadata: { ...meta, email } },
        relationships: { policy: { data: { type: 'policies', id: env.KEYGEN_POLICY_ID } } },
      },
    }),
  });
  const j = await r.json().catch(() => ({}));
  return j?.data?.id ? { key: j.data.attributes?.key } : null;
}

// Calendar-month arithmetic, clamped: Jan 31 + 1 month = Feb 28/29, never Mar 3.
function addMonthsIso(fromIso, months) {
  const d = fromIso ? new Date(fromIso) : new Date();
  if (isNaN(d.getTime())) return addMonthsIso(null, months);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastOfMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastOfMonth));
  return d.toISOString();
}

async function setExpiry(env, licId, iso) {
  if (!iso) return;
  await fetch(`${KG(env)}/licenses/${licId}`, {
    method: 'PATCH', headers: kgHeaders(env),
    body: JSON.stringify({ data: { type: 'licenses', attributes: { expiry: iso } } }),
  });
}

/* ------------------------------ email --------------------------------- */
const ACTIVATION_STEPS =
  `Activate in SketchUp: open ${PRODUCT}, click the menu (top-right) -> ` +
  `"Activate license...", and paste the key.\n` +
  `Full instructions: https://viewmatchpro.com/activate.html\n`;

async function send(env, email, subject, text) {
  if (!env.RESEND_API_KEY || !email) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `${PRODUCT} <support@viewmatchpro.com>`,
      to: [email],
      subject,
      text,
    }),
  });
}

async function emailKey(env, email, key) {
  await send(env, email, `Your ${PRODUCT} license key`,
    `Thanks for subscribing to ${PRODUCT}!\n\n` +
    `Your license key:\n\n  ${key}\n\n` +
    ACTIVATION_STEPS +
    `\nThis is an auto-renewing subscription: it renews automatically each ` +
    `period until you cancel, and you can cancel anytime from the customer ` +
    `portal link on your Polar receipt.\n`);
}

// Polar's fixed set of cancellation reasons, mapped to readable text.
const CANCEL_REASONS = {
  customer_service: 'Customer service',
  low_quality:      'Low quality / not satisfied',
  missing_features: 'Missing features',
  switched_service: 'Switched to another service',
  too_complex:      'Too complicated / hard to use',
  too_expensive:    'Too expensive',
  unused:           "Wasn't using it",
  other:            'Other',
};

// Churn alert to the owner. No-op unless OWNER_EMAIL is set. The reason and
// comment are only present when the customer actually chose/typed them.
async function notifyOwnerCancellation(env, d) {
  if (!env.OWNER_EMAIL) return;
  const who     = d.customer?.email || d.user?.email || 'unknown customer';
  const reason  = CANCEL_REASONS[d.customer_cancellation_reason]
                  || d.customer_cancellation_reason || 'not given';
  const comment = d.customer_cancellation_comment || '';
  const endsRaw = d.current_period_end || d.ends_at;
  const endsOn  = endsRaw ? new Date(endsRaw).toISOString().slice(0, 10) : 'end of current period';
  await send(env, env.OWNER_EMAIL, `${PRODUCT}: a subscription was cancelled`,
    `A ${PRODUCT} subscription was cancelled.\n\n` +
    `Customer:    ${who}\n` +
    `Reason:      ${reason}\n` +
    (comment ? `Comment:     ${comment}\n` : '') +
    `Access ends: ${endsOn}\n\n` +
    `This is a cancel-at-period-end: they keep access until that date, then ` +
    `the licence lapses automatically. No action needed.\n`);
}

// Fixed-term buyers chose the non-renewing option -- say so plainly, and give
// them the expiry date up front so it is never a surprise.
async function emailFixedTermKey(env, email, key, expiryIso) {
  const on = expiryIso ? new Date(expiryIso).toISOString().slice(0, 10) : null;
  await send(env, email, `Your ${PRODUCT} license key`,
    `Thanks for buying ${PRODUCT}!\n\n` +
    `Your license key:\n\n  ${key}\n\n` +
    ACTIVATION_STEPS +
    `\nThis is a fixed-term license${on ? `, active until ${on}` : ''}. ` +
    `It does NOT auto-renew -- your card will not be charged again, and ` +
    `nothing happens unless you choose to buy another term.\n` +
    (env.RENEW_URL ? `\nWhen you want more time: ${env.RENEW_URL}\n` : ''));
}
