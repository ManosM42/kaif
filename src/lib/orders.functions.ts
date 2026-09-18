import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "./supabase-admin.server";
import { verifyAdminSession } from "./auth.server";

async function requireAdmin() {
  const session = await verifyAdminSession();
  if (session?.role !== "admin") throw new Error("Unauthorized");
}

export type OrderItemRow = {
  id: string;
  sku: string;
  name: string;
  unit_price: number;
  quantity: number;
  size: string | null;
};

export type OrderRow = {
  id: string;
  stripe_session_id: string;
  customer_email: string | null;
  customer_name: string | null;
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    state?: string;
  } | null;
  amount_total: number;
  currency: string;
  status: string;
  fulfillment_status: string;
  tracking_code: string | null;
  created_at: string;
  items: OrderItemRow[];
};

export const listOrders = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !orders) {
    console.error("[listOrders] error:", error);
    return { orders: [] as OrderRow[], totalRevenue: 0 };
  }

  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("*")
    .in("order_id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"]);

  const result: OrderRow[] = orders.map((o) => ({
    ...o,
    items: (items ?? []).filter((i) => i.order_id === o.id),
  }));

  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.amount_total), 0);

  return { orders: result, totalRevenue };
});

export const markOrderShipped = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; trackingCode: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ fulfillment_status: "shipped", tracking_code: data.trackingCode || null })
      .eq("id", data.orderId);
    if (error) throw new Error(`Ενημέρωση απέτυχε: ${error.message}`);
    return { ok: true as const };
  });

export const markOrderPending = createServerFn({ method: "POST" })
  .validator((data: { orderId: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ fulfillment_status: "pending" })
      .eq("id", data.orderId);
    if (error) throw new Error(`Ενημέρωση απέτυχε: ${error.message}`);
    return { ok: true as const };
  });