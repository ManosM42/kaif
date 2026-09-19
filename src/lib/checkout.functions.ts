import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { supabaseAdmin } from "./supabase-admin.server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

type CartItemInput = { productId: string; size: string; quantity: number };

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: {
    items: CartItemInput[];
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    shipping: {
      name: string;
      address: string;
      city: string;
      postal_code: string;
      country: string;
      state: string;
    };
  }) => data)
  .handler(async ({ data }) => {
    if (!data.items.length) throw new Error("Το καλάθι είναι άδειο");

    const productIds = data.items.map((i) => i.productId);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("id", productIds);

    if (error || !products) throw new Error("Αποτυχία φόρτωσης προϊόντων");

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Προϊόν δεν βρέθηκε: ${item.productId}`);
      if ((product.stocks[item.size] ?? 0) < item.quantity) {
        throw new Error(`Ανεπαρκές απόθεμα για ${product.name} (${item.size})`);
      }

      line_items.push({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(Number(product.price) * 100),
          product_data: {
            name: `${product.name} (${item.size})`,
            images: product.image_url ? [product.image_url] : undefined,
          },
        },
      });
    }

    // Remove any trailing slash from SITE_URL, otherwise the return URL becomes
    // "https://site.com//checkout/success" (double slash) and the page 404s.
    const origin = (process.env.SITE_URL || "http://localhost:3001").replace(/\/+$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded",
      line_items,
      customer_email: data.customer.email,

      // FIX: `shipping` is not a valid top-level parameter for Checkout Sessions.
      // The shipping details belong inside `payment_intent_data`.
      payment_intent_data: {
        shipping: {
          name: data.shipping.name,
          phone: data.customer.phone || undefined,
          address: {
            line1: data.shipping.address,
            city: data.shipping.city,
            postal_code: data.shipping.postal_code,
            country: data.shipping.country, // must be a 2-letter code: "GR", "DE", "US"...
            state: data.shipping.state || undefined, // avoid sending an empty string
          },
        },
      },

      return_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        cart: JSON.stringify(data.items),
        customer_phone: data.customer.phone,
        customer_first_name: data.customer.firstName,
        customer_last_name: data.customer.lastName,
        shipping_address: JSON.stringify({
          address: data.shipping.address,
          city: data.shipping.city,
          postal_code: data.shipping.postal_code,
          country: data.shipping.country,
          state: data.shipping.state,
        }),
      },
    });

    return { clientSecret: session.client_secret };
  });

export const getCheckoutSessionStatus = createServerFn({ method: "GET" })
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    return {
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email ?? null,
      customerName: session.customer_details?.name ?? null,
      amountTotal: (session.amount_total ?? 0) / 100,
      currency: session.currency,
    };
  });

export const finalizeOrder = createServerFn({ method: "POST" })
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    if (session.payment_status !== "paid") {
      return { ok: false as const, error: "Η πληρωμή δεν έχει ολοκληρωθεί" };
    }

    // Idempotency: μην ξαναγράψεις την ίδια παραγγελία αν γίνει refresh στη σελίδα επιτυχίας
    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing) {
      return { ok: true as const, alreadyProcessed: true };
    }

    const cartItems: CartItemInput[] = session.metadata?.cart
      ? JSON.parse(session.metadata.cart)
      : [];

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email ?? null,
        customer_name: ((`${session.metadata?.customer_first_name ?? ""} ${session.metadata?.customer_last_name ?? ""}`).trim()) || (session.customer_details?.name ?? null),
        customer_phone: session.metadata?.customer_phone ?? null,
        shipping_address: session.metadata?.shipping_address ? JSON.parse(session.metadata.shipping_address) : session.customer_details?.address ?? null,
        amount_total: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? "eur",
        status: "paid",
      })
      .select()
      .single();

    if (orderError || !order) throw new Error("Αποτυχία καταγραφής παραγγελίας");

    if (cartItems.length > 0) {
      const productIds = cartItems.map((i) => i.productId);
      const { data: products } = await supabaseAdmin.from("products").select("*").in("id", productIds);

      const orderItemsRows = cartItems.map((item) => {
        const product = products?.find((p) => p.id === item.productId);
        return {
          order_id: order.id,
          product_id: item.productId,
          sku: product?.sku ?? "?",
          name: product?.name ?? "?",
          unit_price: product?.price ?? 0,
          quantity: item.quantity,
          size: item.size,
        };
      });

      await supabaseAdmin.from("order_items").insert(orderItemsRows);

      // Μείωση αποθέματος ανά μέγεθος
      for (const item of cartItems) {
        const product = products?.find((p) => p.id === item.productId);
        if (!product) continue;
        const currentStocks = product.stocks || {};
        const updatedStocks = {
          ...currentStocks,
          [item.size]: Math.max(0, (currentStocks[item.size] ?? 0) - item.quantity),
        };
        await supabaseAdmin.from("products").update({ stocks: updatedStocks }).eq("id", item.productId);
      }
    }

    return { ok: true as const, alreadyProcessed: false, order };
  });