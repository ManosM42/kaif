import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

export const COOKIE_NAME = "kaif_admin_session";

export async function verifyAdminSession() {
  const token = getCookie(COOKIE_NAME);
  return token ? { role: "admin" } : null;
}

export async function setAdminCookie(token: string, maxAge: number) {
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAge,
  });
}

export async function deleteAdminCookie() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export async function getAdminToken() {
  return getCookie(COOKIE_NAME);
}
