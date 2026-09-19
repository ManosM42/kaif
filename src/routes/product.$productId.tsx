import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { listProducts } from "@/lib/products.functions";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/product/$productId")({
  loader: async ({ params }) => {
    const { products } = await listProducts();
    const product = products.find((p) => String(p.id) === params.productId);
    if (!product) throw notFound();
    return product;
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-kaif-black px-4 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-kaif-chrome-dim">
        PRODUCT NOT FOUND
      </p>
      <Link
        to="/"
        className="border border-white/20 px-6 py-3 font-mono text-[10px] tracking-[0.3em] text-kaif-chrome transition-colors hover:border-kaif-toxic hover:text-kaif-toxic"
      >
        ← BACK TO SHOP
      </Link>
    </div>
  ),
  component: ProductPage,
});

const FALLBACK_SIZES = ["S", "M", "L", "XL"];

// Reads the stock per size (e.g. { S: 3, M: 0, L: 5 }) if the product has it
function getStocks(product: unknown): Record<string, number> {
  const stocks = (product as { stocks?: Record<string, number> } | null)?.stocks;
  return stocks && typeof stocks === "object" ? stocks : {};
}

function ProductPage() {
  const product = Route.useLoaderData();
  const [size, setSize] = useState<string | null>(null);
  const [showSizeHint, setShowSizeHint] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { items, addItem, open } = useCart();

  const stocks = getStocks(product);
  const sizes = Object.keys(stocks).length > 0 ? Object.keys(stocks) : FALLBACK_SIZES;
  const hasStockInfo = Object.keys(stocks).length > 0;
  const soldOut = hasStockInfo && sizes.every((s) => (stocks[s] ?? 0) <= 0);

  function handleAdd() {
    if (!size) {
      setShowSizeHint(true);
      return;
    }

    // Don't let the customer put more in the bag than what's in stock
    const productId = String(product.id);
    const inBag =
      items.find((i) => String(i.productId) === productId && i.size === size)?.quantity ?? 0;
    const available = hasStockInfo ? (stocks[size] ?? 0) : Infinity;
    if (inBag + 1 > available) {
      setNotice(`ONLY ${available} IN STOCK FOR SIZE ${size}`);
      return;
    }

    setNotice(null);
    addItem({
      productId,
      name: product.name,
      price: Number(product.price),
      image: product.image,
      size,
      quantity: 1,
    });
    open(); // slides the bag open so the customer sees the item was added
  }

  return (
    <main className="min-h-screen bg-kaif-black px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto max-w-[1400px]">
        <Link
          to="/"
          className="font-mono text-[10px] tracking-[0.4em] text-kaif-chrome-dim transition-colors hover:text-kaif-toxic"
        >
          ← BACK
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-16">
          {/* image */}
          <div className="md:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-kaif-void">
              <img
                src={product.image}
                alt={product.alt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          {/* info */}
          <div className="md:col-span-5 md:sticky md:top-32 md:self-start">
            <p className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
              // {product.sku}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-none tracking-tight text-kaif-chrome md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-6 font-mono text-lg text-kaif-chrome">€{product.price}</p>

            {/* sizes */}
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
                  SELECT SIZE
                </span>
                {showSizeHint && !size && (
                  <span className="font-mono text-[10px] tracking-[0.3em] text-kaif-toxic">
                    CHOOSE A SIZE
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const outOfStock = hasStockInfo && (stocks[s] ?? 0) <= 0;
                  const selected = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => {
                        setSize(s);
                        setShowSizeHint(false);
                        setNotice(null);
                      }}
                      aria-pressed={selected}
                      className={`min-w-14 border px-4 py-3 font-mono text-xs tracking-widest transition-colors ${
                        selected
                          ? "border-kaif-toxic text-kaif-toxic"
                          : "border-white/20 text-kaif-chrome hover:border-white/60"
                      } ${outOfStock ? "cursor-not-allowed line-through opacity-30 hover:border-white/20" : ""}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className="mt-10 w-full border border-kaif-toxic bg-kaif-toxic px-6 py-4 font-mono text-xs tracking-[0.3em] text-kaif-black transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-kaif-chrome-dim disabled:opacity-100"
            >
              {soldOut ? "SOLD OUT" : "ADD TO CART"}
            </button>
            {notice && (
              <p className="mt-3 font-mono text-[10px] tracking-[0.3em] text-kaif-toxic" role="alert">
                {notice}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}