import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { loginAdmin } from "@/lib/auth.functions";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await loginAdmin({ data: { email, password } });
    setLoading(false);
    if (res.ok) navigate({ to: "/admin" });
    else setError(res.error ?? "Κάτι πήγε στραβά");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-kaif-black px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 border border-white/10 p-8">
        <h1 className="font-mono text-xs tracking-[0.3em] text-kaif-chrome-dim">ADMIN ACCESS</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-white/20 bg-transparent px-3 py-2 text-white"
          autoFocus
          autoComplete="username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border border-white/20 bg-transparent px-3 py-2 text-white"
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-kaif-toxic px-6 py-3 font-mono text-xs tracking-[0.3em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black disabled:opacity-50"
        >
          {loading ? "..." : "ENTER →"}
        </button>
      </form>
    </div>
  );
}