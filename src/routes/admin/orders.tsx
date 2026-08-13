import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getAdminSession } from "@/lib/auth.functions";
import { listOrders, markOrderShipped, markOrderPending, type OrderRow } from "@/lib/orders.functions";

export const Route = createFileRoute("/admin/orders")({
  beforeLoad: async () => {
    const session = await getAdminSession();
    if (!session.isAdmin) throw redirect({ to: "/admin/login" });
  },
  loader: async () => listOrders(),
  component: OrdersAdmin,
});

function formatAddress(addr: OrderRow["shipping_address"]) {
  if (!addr) return "—";
  const parts = [addr.line1, addr.line2, addr.postal_code, addr.city, addr.state, addr.country].filter(Boolean);
  return parts.join(", ");
}

function OrdersAdmin() {
  const initial = Route.useLoaderData();
  const [orders, setOrders] = useState(initial.orders);
  const [totalRevenue, setTotalRevenue] = useState(initial.totalRevenue);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  async function refresh() {
    const fresh = await listOrders();
    setOrders(fresh.orders);
    setTotalRevenue(fresh.totalRevenue);
  }

  async function handleMarkShipped(orderId: string) {
    setBusyId(orderId);
    try {
      await markOrderShipped({ data: { orderId, trackingCode: trackingInputs[orderId] ?? "" } });
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Η ενημέρωση απέτυχε.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkPending(orderId: string) {
    setBusyId(orderId);
    try {
      await markOrderPending({ data: { orderId } });
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Η ενημέρωση απέτυχε.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/admin" className="font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim underline">
            ← ADMIN
          </Link>
          <h1 className="mt-3 font-display text-3xl">ΠΑΡΑΓΓΕΛΙΕΣ</h1>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">ΣΥΝΟΛΙΚΑ ΕΣΟΔΑ</p>
          <p className="font-mono text-2xl text-kaif-toxic">€{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="font-mono text-xs text-kaif-chrome-dim">Δεν υπάρχουν παραγγελίες ακόμα.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isShipped = order.fulfillment_status === "shipped";
            return (
              <div key={order.id} className="border border-white/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
                      {new Date(order.created_at).toLocaleString("el-GR")}
                    </p>
                    <p className="mt-1 font-mono text-sm text-white">
                      {order.customer_name || "Χωρίς όνομα"}
                    </p>
                    <p className="font-mono text-xs text-kaif-chrome-dim">{order.customer_email || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg text-kaif-toxic">€{Number(order.amount_total).toFixed(2)}</p>
                    <span
                      className={`mt-1 inline-block border px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] ${
                        isShipped
                          ? "border-green-500 text-green-500"
                          : "border-yellow-500 text-yellow-500"
                      }`}
                    >
                      {isShipped ? "ΣΤΑΛΘΗΚΕ" : "ΕΚΚΡΕΜΕΙ"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">ΔΙΕΥΘΥΝΣΗ</p>
                  <p className="font-mono text-xs text-white">{formatAddress(order.shipping_address)}</p>
                </div>

                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">ΠΡΟΪΟΝΤΑ</p>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id} className="font-mono text-xs text-kaif-chrome-dim">
                        {item.quantity}× {item.name} ({item.size}) — €{Number(item.unit_price).toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
                  {isShipped ? (
                    <>
                      {order.tracking_code && (
                        <p className="font-mono text-xs text-kaif-chrome-dim">
                          Tracking: <span className="text-kaif-chrome">{order.tracking_code}</span>
                        </p>
                      )}
                      <button
                        onClick={() => handleMarkPending(order.id)}
                        disabled={busyId === order.id}
                        className="ml-auto border border-white/20 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim hover:border-white/40 disabled:opacity-50"
                      >
                        {busyId === order.id ? "..." : "ΕΠΑΝΑΦΟΡΑ ΣΕ ΕΚΚΡΕΜΕΙ"}
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Κωδικός αποστολής (προαιρετικό)"
                        value={trackingInputs[order.id] ?? ""}
                        onChange={(e) =>
                          setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        className="flex-1 min-w-[200px] border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white"
                      />
                      <button
                        onClick={() => handleMarkShipped(order.id)}
                        disabled={busyId === order.id}
                        className="border border-kaif-toxic px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black disabled:opacity-50"
                      >
                        {busyId === order.id ? "..." : "ΤΟ ΠΡΟΪΟΝ ΣΤΑΛΘΗΚΕ"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}