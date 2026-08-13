import { createServerFn } from "@tanstack/react-start";
import { setCookie, deleteCookie, getCookie } from "@tanstack/react-start/server";
import { createSessionToken, verifySessionToken } from "./session.server";
import { supabaseAnon } from "./supabase-anon.server";

const COOKIE_NAME = "kaif_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 ώρες

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { data: authData, error } = await supabaseAnon.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      return { ok: false as const, error: "Λάθος email ή κωδικός" };
    }

    const token = await createSessionToken({
      role: "admin",
      sub: authData.user.id,
      exp: Date.now() + SESSION_TTL_MS,
    });

    setCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_MS / 1000,
    });

    return { ok: true as const };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { ok: true as const };
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie(COOKIE_NAME);
  const session = await verifySessionToken(token);
  return { isAdmin: session?.role === "admin" };
});