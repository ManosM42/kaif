import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getAdminSession, logoutAdmin } from "@/lib/auth.functions";
import { getLockStatus, setLockStatus } from "@/lib/site-settings.functions";


export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    const session = await getAdminSession();
    if (!session.isAdmin) throw redirect({ to: "/admin/login" });
  },
  loader: async () => ({ isLocked: (await getLockStatus()).isLocked }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isLocked: initialLocked } = Route.useLoaderData();
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [busy, setBusy] = useState(false);
  const navigate = Route.useNavigate();

  async function toggleLock() {
    setBusy(true);
    const next = !isLocked;
    await setLockStatus({ data: { locked: next } });
    setIsLocked(next);
    setBusy(false);
  }

  async function handleLogout() {
    await logoutAdmin();
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl">ADMIN</h1>
        <button onClick={handleLogout} className="font-mono text-xs text-kaif-chrome-dim underline">
          Αποσύνδεση
        </button>
      </div>

      <div className="flex items-center justify-between border border-white/10 p-6">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-kaif-chrome-dim">SITE STATUS</p>
          <p className={`mt-1 text-lg ${isLocked ? "text-red-500" : "text-green-500"}`}>
            {isLocked ? "ΚΛΕΙΔΩΜΕΝΟ" : "ΕΝΕΡΓΟ"}
          </p>
        </div>
        <button
          onClick={toggleLock}
          disabled={busy}
          className={`border px-6 py-3 font-mono text-xs tracking-[0.2em] disabled:opacity-50 ${
            isLocked
              ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
              : "border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
          }`}
        >
          {isLocked ? "ΞΕΚΛΕΙΔΩΣΕ" : "ΚΛΕΙΔΩΣΕ"}
        </button>
      </div>

      <Link
  to="/admin/products"
  className="mt-10 inline-block border border-white/20 px-6 py-3 font-mono text-xs tracking-[0.2em] text-kaif-chrome-dim hover:border-kaif-toxic hover:text-kaif-toxic"
>
  ΔΙΑΧΕΙΡΙΣΗ ΠΡΟΪΟΝΤΩΝ →
</Link>
    </div>
  );
}