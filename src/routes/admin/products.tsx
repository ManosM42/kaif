import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { getAdminSession } from "@/lib/auth.functions";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products.functions";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/admin/products")({
  beforeLoad: async () => {
    const session = await getAdminSession();
    if (!session.isAdmin) throw redirect({ to: "/admin/login" });
  },
  loader: async () => (await listProducts()).products,
  component: ProductsAdmin,
});

const CATEGORIES: Product["category"][] = ["outerwear", "tops", "bottoms", "accessories"];
const GENDERS: Product["gender"][] = ["men", "women", "unisex"];

type FormState = {
  id: string | null;
  sku: string;
  name: string;
  price: string;
  category: Product["category"];
  gender: Product["gender"];
  alt: string;
  stock: string;   // ← νέο
};

const EMPTY_FORM: FormState = {
  id: null,
  sku: "",
  name: "",
  price: "",
  category: "tops",
  gender: "unisex",
  alt: "",
  stock: "0",   // ← νέο
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ProductsAdmin() {
  const initialProducts = Route.useLoaderData();
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const isEditing = form.id !== null;

  async function refresh() {
    const { products: fresh } = await listProducts();
    setProducts(fresh);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  }

  function handleFile(file: File | null) {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }

  function startEdit(p: Product) {
  setForm({
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: String(p.price),
    category: p.category,
    gender: p.gender,
    alt: p.alt,
    stock: String(p.stock),   // ← νέο
  });
    setImageFile(null);
    setImagePreview(p.image || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Σίγουρα θέλεις να διαγράψεις αυτό το προϊόν;")) return;
    setBusy(true);
    try {
      await deleteProduct({ data: { id } });
      await refresh();
      if (form.id === id) resetForm();
    } catch (err) {
      console.error(err);
      alert("Η διαγραφή απέτυχε.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setError(null);

  const price = parseFloat(form.price);
  const stock = parseInt(form.stock, 10);
  if (!form.sku.trim() || !form.name.trim() || Number.isNaN(price) || Number.isNaN(stock) || stock < 0) {
    setError("Συμπλήρωσε SKU, όνομα, έγκυρη τιμή και έγκυρο stock (≥ 0).");
    return;
  }
  if (!isEditing && !imageFile) {
    setError("Χρειάζεται εικόνα για νέο προϊόν.");
    return;
  }

  setBusy(true);
  try {
    let imageBase64: string | undefined;
    let imageFileName: string | undefined;
    if (imageFile) {
      imageBase64 = await fileToBase64(imageFile);
      imageFileName = imageFile.name;
    }

    if (isEditing) {
      await updateProduct({
        data: {
          id: form.id!,
          sku: form.sku.trim(),
          name: form.name.trim(),
          price,
          category: form.category,
          gender: form.gender,
          alt: form.alt.trim() || form.name.trim(),
          stock,
          imageBase64,
          imageFileName,
        },
      });
    } else {
      await createProduct({
        data: {
          sku: form.sku.trim(),
          name: form.name.trim(),
          price,
          category: form.category,
          gender: form.gender,
          alt: form.alt.trim() || form.name.trim(),
          stock,
          imageBase64: imageBase64!,
          imageFileName: imageFileName!,
        },
      });
    }

    await refresh();
    resetForm();
  } catch (err) {
    console.error(err);
    setError(err instanceof Error ? err.message : "Κάτι πήγε στραβά.");
  } finally {
    setBusy(false);
  }
}

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            to="/admin"
            className="font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim underline"
          >
            ← ADMIN
          </Link>
          <h1 className="mt-3 font-display text-3xl">ΠΡΟΪΟΝΤΑ</h1>
        </div>
        <span className="font-mono text-xs text-kaif-chrome-dim">
          {products.length} ΣΥΝΟΛΙΚΑ
        </span>
      </div>

      {/* ---------- ΦΟΡΜΑ ---------- */}
      <form
        onSubmit={handleSubmit}
        className="mb-12 space-y-5 border border-white/10 p-6"
      >
        <h2 className="font-mono text-xs tracking-[0.2em] text-kaif-toxic">
          {isEditing ? "ΕΠΕΞΕΡΓΑΣΙΑ ΠΡΟΪΟΝΤΟΣ" : "ΝΕΟ ΠΡΟΪΟΝ"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
              SKU
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="KF/009"
              className="w-full border border-white/20 bg-transparent px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
              ΟΝΟΜΑ
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Void Hood"
              className="w-full border border-white/20 bg-transparent px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
              ΤΙΜΗ (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="480"
              className="w-full border border-white/20 bg-transparent px-3 py-2 text-white"
            />
          </div>
          <div>
  <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
    STOCK (τεμάχια)
  </label>
  <input
    type="number"
    step="1"
    min="0"
    value={form.stock}
    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
    placeholder="12"
    className="w-full border border-white/20 bg-transparent px-3 py-2 text-white"
  />
</div>

          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
              ALT TEXT (προαιρετικό)
            </label>
            <input
              type="text"
              value={form.alt}
              onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
              placeholder="Περιγραφή εικόνας"
              className="w-full border border-white/20 bg-transparent px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
              ΚΑΤΗΓΟΡΙΑ
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as Product["category"] }))
              }
              className="w-full border border-white/20 bg-kaif-black px-3 py-2 text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          

          <div>
            <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
              ΦΥΛΟ
            </label>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm((f) => ({ ...f, gender: e.target.value as Product["gender"] }))
              }
              className="w-full border border-white/20 bg-kaif-black px-3 py-2 text-white"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---------- IMAGE PICKER ---------- */}
        <div>
          <label className="mb-1 block font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
            ΕΙΚΟΝΑ {isEditing && "(άσε κενό για να κρατήσεις την υπάρχουσα)"}
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`flex items-center gap-4 border border-dashed p-4 transition ${
              dragOver ? "border-kaif-toxic bg-kaif-toxic/5" : "border-white/20"
            }`}
          >
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="h-20 w-20 flex-shrink-0 object-cover"
              />
            )}
            <div className="flex-1">
              <label className="inline-block cursor-pointer border border-white/20 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim hover:border-kaif-toxic hover:text-kaif-toxic">
                ΕΠΙΛΟΓΗ ΑΡΧΕΙΟΥ
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-2 font-mono text-[10px] text-kaif-chrome-dim">
                ή σύρε & άσε εδώ μια εικόνα
              </p>
            </div>
          </div>
        </div>

        {error && <p className="font-mono text-xs text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="border border-kaif-toxic px-6 py-3 font-mono text-xs tracking-[0.2em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black disabled:opacity-50"
          >
            {busy ? "..." : isEditing ? "ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ" : "ΠΡΟΣΘΗΚΗ ΠΡΟΪΟΝΤΟΣ"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-white/20 px-6 py-3 font-mono text-xs tracking-[0.2em] text-kaif-chrome-dim hover:border-white/40"
            >
              ΑΚΥΡΩΣΗ
            </button>
          )}
        </div>
      </form>

      {/* ---------- ΛΙΣΤΑ ΠΡΟΪΟΝΤΩΝ ---------- */}
      <div className="space-y-3">
        {products.length === 0 && (
          <p className="font-mono text-xs text-kaif-chrome-dim">Δεν υπάρχουν προϊόντα ακόμα.</p>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 border border-white/10 p-4"
          >
            <img src={p.image} alt={p.alt} className="h-16 w-16 flex-shrink-0 object-cover" />
            <div className="flex-1">
              <p className="font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
                {p.sku} · {p.category} · {p.gender}
              </p>
              <p className="font-mono text-sm text-white">{p.name}</p>
              <p className="font-mono text-xs text-kaif-toxic">€{p.price}</p>
              <p className="font-mono text-xs text-kaif-toxic">
  €{p.price} · {p.stock > 0 ? `${p.stock} τεμ.` : "SOLD OUT"}
</p>
            </div>
            <button
              onClick={() => startEdit(p)}
              className="border border-white/20 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim hover:border-kaif-chrome hover:text-kaif-chrome"
            >
              ΕΠΕΞΕΡΓΑΣΙΑ
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              disabled={busy}
              className="border border-red-500/40 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-black disabled:opacity-50"
            >
              ΔΙΑΓΡΑΦΗ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}