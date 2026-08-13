import { supabaseAdmin } from "./supabase-admin.server";
import { verifySessionToken } from "./session.server";
import kaifLogoUrl from "@/assets/kaif-logo.jpg?url";

let cache: { locked: boolean; ts: number } | null = null;
const CACHE_MS = 5000;

async function isLocked(): Promise<boolean> {
  if (cache && Date.now() - cache.ts < CACHE_MS) return cache.locked;
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("is_locked")
    .eq("id", 1)
    .single();
  const locked = error ? false : !!data?.is_locked;
  cache = { locked, ts: Date.now() };
  return locked;
}

export function invalidateLockCache() {
  cache = null;
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const ALLOWED_WHEN_LOCKED = ["/admin", "/assets", "/_build", "/favicon", "/robots.txt", "/sitemap.xml", "/_serverFn"];

export async function shouldBlockRequest(request: Request): Promise<boolean> {
  const url = new URL(request.url);
  if (ALLOWED_WHEN_LOCKED.some((p) => url.pathname.startsWith(p))) return false;

  const token = getCookieValue(request.headers.get("cookie"), "kaif_admin_session");
  const session = await verifySessionToken(token);
  if (session?.role === "admin") return false;

  return isLocked();
}

export function renderLockedPage(): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>KAIF — Opening Soon</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@300;400;500&display=swap">
<style>
  :root {
    --kaif-black: #0A0B0A;
    --kaif-void: #050505;
    --kaif-chrome: #E8EAE6;
    --kaif-chrome-dim: #9BA39C;
    --kaif-toxic: #39FF6A;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
  html, body {
    height: 100%;
    background-color: var(--kaif-black);
    color: var(--kaif-chrome);
    font-family: "JetBrains Mono", ui-monospace, monospace;
    overflow: hidden;
  }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .grain::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    opacity: 0.06;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.7 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  }

  .glow-orb {
    position: fixed;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(57,255,106,0.10) 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    animation: breathe 4s ease-in-out infinite;
  }

  @keyframes breathe {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 24px;
  }

  .logo-img {
    max-width: min(360px, 60vw);
    width: 100%;
    height: auto;
    filter: drop-shadow(0 4px 0 rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(57,255,106,0.25));
  }

  .divider {
    width: 60px;
    height: 1px;
    background: var(--kaif-toxic);
    margin: 28px auto;
    box-shadow: 0 0 12px rgba(57,255,106,0.6);
  }

  .status {
    font-size: 0.7rem;
    letter-spacing: 0.4em;
    color: var(--kaif-toxic);
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .message {
    font-size: 0.75rem;
    letter-spacing: 0.25em;
    color: var(--kaif-chrome-dim);
    text-transform: uppercase;
  }

  .barbed {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.35;
    z-index: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .glow-orb { animation: none; }
  }
</style>
</head>
<body class="grain">
  <div class="glow-orb"></div>

  <svg class="barbed" width="280" height="24" viewBox="0 0 280 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="12" x2="280" y2="12" stroke="#9BA39C" stroke-width="1"/>
    <path d="M20 12 L14 2 M20 12 L26 2 M20 12 L14 22 M20 12 L26 22" stroke="#39FF6A" stroke-width="1" opacity="0.7"/>
    <path d="M100 12 L94 2 M100 12 L106 2 M100 12 L94 22 M100 12 L106 22" stroke="#39FF6A" stroke-width="1" opacity="0.7"/>
    <path d="M180 12 L174 2 M180 12 L186 2 M180 12 L174 22 M180 12 L186 22" stroke="#39FF6A" stroke-width="1" opacity="0.7"/>
    <path d="M260 12 L254 2 M260 12 L266 2 M260 12 L254 22 M260 12 L266 22" stroke="#39FF6A" stroke-width="1" opacity="0.7"/>
  </svg>

  <div class="content">
    <p class="status">● Signal Standby</p>
    <img src="${kaifLogoUrl}" alt="KAIF" class="logo-img" />
    <div class="divider"></div>
    <p class="message">Opening Soon</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}