import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { supabaseAdmin } from "./supabase-admin.server";
import { verifySessionToken } from "./session.server";
import type { Product } from "./products";

async function requireAdmin() {
  const session = await verifySessionToken(getCookie("kaif_admin_session"));
  if (session?.role !== "admin") throw new Error("Unauthorized");
}

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    gender: row.gender,
    image: row.image_url ?? "",
    alt: row.alt ?? row.name,
    stock: Number(row.stock ?? 0),
  };
}

// -------- Public: όλοι οι επισκέπτες --------
export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listProducts] error:", error);
    return { products: [] as Product[] };
  }
  return { products: (data ?? []).map(rowToProduct) };
});

// -------- Admin only --------
export const createProduct = createServerFn({ method: "POST" })
  .validator((data: {
    sku: string;
    name: string;
    price: number;
    category: Product["category"];
    gender: Product["gender"];
    alt: string;
    stock: number;
    imageBase64: string;
    imageFileName: string;
  }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();

    const match = data.imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (!match) throw new Error("Λάθος μορφή εικόνας");
    const [, contentType, base64] = match;
    const bytes = Buffer.from(base64, "base64");

    const ext = data.imageFileName.split(".").pop() || "jpg";
    const path = `${data.sku.replace(/[^a-zA-Z0-9-_]/g, "_")}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, bytes, { contentType, upsert: false });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(path);

    const { error: insertError } = await supabaseAdmin.from("products").insert({
      sku: data.sku,
      name: data.name,
      price: data.price,
      category: data.category,
      gender: data.gender,
      alt: data.alt,
      stock: data.stock,
      image_url: publicUrlData.publicUrl,
    });

    if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

    return { ok: true as const };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: {
    id: string;
    sku: string;
    name: string;
    price: number;
    category: Product["category"];
    gender: Product["gender"];
    alt: string;
    stock: number;
    imageBase64?: string;
    imageFileName?: string;
  }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();

    const update: Record<string, unknown> = {
  sku: data.sku,
  name: data.name,
  price: data.price,
  category: data.category,
  gender: data.gender,
  alt: data.alt,
  stock: data.stock,   // ← πρόσθεσέ το
};

    if (data.imageBase64 && data.imageFileName) {
      const match = data.imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (!match) throw new Error("Λάθος μορφή εικόνας");
      const [, contentType, base64] = match;
      const bytes = Buffer.from(base64, "base64");
      const ext = data.imageFileName.split(".").pop() || "jpg";
      const path = `${data.sku.replace(/[^a-zA-Z0-9-_]/g, "_")}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(path, bytes, { contentType, upsert: false });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("product-images")
        .getPublicUrl(path);
      update.image_url = publicUrlData.publicUrl;
    }

    const { error } = await supabaseAdmin.from("products").update(update).eq("id", data.id);
    if (error) throw new Error(`Update failed: ${error.message}`);

    return { ok: true as const };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(`Delete failed: ${error.message}`);
    return { ok: true as const };
  });