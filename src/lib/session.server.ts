const encoder = new TextEncoder();

async function getKey() {
  const secret = process.env.SESSION_SECRET!;
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(payload: { role: "admin"; sub: string; exp: number }) {
  const key = await getKey();
  const body = btoa(JSON.stringify(payload));
  const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const key = await getKey();
  const expectedSigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSig = btoa(String.fromCharCode(...new Uint8Array(expectedSigBuf)));
  if (sig !== expectedSig) return null;

  try {
    const payload = JSON.parse(atob(body)) as { role: string; sub: string; exp: number };
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}