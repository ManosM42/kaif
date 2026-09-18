import { createServerFn } from "@tanstack/react-start";
import { supabaseAnon } from "./supabase-anon.server";
import { setAdminCookie, deleteAdminCookie, getAdminToken } from "./auth.server";

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 ώρες

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { data: authData, error } = await supabaseAnon.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.session) {
      return { ok: false as const, error: "Λάθος email ή κωδικός" };
    }

    const token = authData.session.access_token;

    await setAdminCookie(token, SESSION_TTL_MS / 1000);

    return { ok: true as const };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  await deleteAdminCookie();
  return { ok: true as const };
});

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const token = await getAdminToken();
  return { isAdmin: !!token };
});
