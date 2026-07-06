import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { supabaseAdmin } from "./supabase-admin.server";
import { verifySessionToken } from "./session.server";
import { invalidateLockCache } from "./lock-check.server";

async function requireAdmin() {
  const session = await verifySessionToken(getCookie("kaif_admin_session"));
  if (session?.role !== "admin") throw new Error("Unauthorized");
}

export const getLockStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("site_settings").select("is_locked").eq("id", 1).single();
  console.log("[getLockStatus] data:", data, "error:", error);
  return { isLocked: !!data?.is_locked };
});

export const setLockStatus = createServerFn({ method: "POST" })
  .validator((data: { locked: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    console.log("[setLockStatus] setting locked to:", data.locked);
    const { data: updated, error } = await supabaseAdmin
      .from("site_settings")
      .update({ is_locked: data.locked, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select();
    console.log("[setLockStatus] updated rows:", updated, "error:", error);
    invalidateLockCache();
    return { ok: true as const };
  });