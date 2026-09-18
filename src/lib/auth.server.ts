import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export const COOKIE_NAME = "kaif_admin_session";

export async function setAdminCookie(token: string, maxAgeSeconds: number) {
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function deleteAdminCookie() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export async function getAdminToken(): Promise<string | null> {
  try {
    return getCookie(COOKIE_NAME) ?? null;
  } catch {
    return null;
  }
}

export async function verifyAdminSession(request?: Request) {
  let token: string | undefined | null;

  if (request) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
      token = match ? decodeURIComponent(match[1]) : null;
    }
  } else {
    token = await getAdminToken();
  }

  return token ? { role: "admin" } : null;
}