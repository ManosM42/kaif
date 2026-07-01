import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import mensImg from "@/assets/men-split.jpg";
import womensImg from "@/assets/women-split.jpg";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, type Product } from "@/lib/products";

export const Route = createFileRoute("/clothing")({
  head: () => ({
    meta: [
      { title: "Clothing — KAIF" },
      {
        name: "description",
        content:
          "KAIF Clothing. Outerwear, tops, bottoms and accessories. Men's and women's.",
      },
      { property: "og:title", content: "Clothing — KAIF" },
      {
        property: "og:description",
        content: "Limited-run luxury streetwear. Men's and women's.",
      },
    ],
  }),
  component: Clothing,
});

type Gender = "men" | "women" | null;
const CATEGORIES = ["all", "outerwear", "tops", "bottoms", "accessories"] as const;
type Category = (typeof CATEGORIES)[number];

function Clothing() {
  const [gender, setGender] = useState<Gender>(null);
  const [cat, setCat] = useState<Category>("all");
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(
      (p) =>
        (gender ? p.gender === gender || p.gender === "unisex" : true) &&
        (cat === "all" ? true : p.category === cat),
    );
  }, [gender, cat]);

  return (
    <>
      {gender === null ? (
        <SplitSelector onSelect={setGender} />
      ) : (
        <section className="min-h-screen px-5 pt-32 pb-24 md:px-10">
          <div className="mx-auto max-w-[1600px]">
            {/* header */}
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
              <div>
                <p className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
                  // COLLECTION
                </p>
                <h1 className="mt-3 font-display text-6xl leading-none tracking-tight text-kaif-chrome md:text-8xl">
                  {gender === "men" ? "Men" : "Women"}
                </h1>
              </div>
              <div className="flex gap-2 font-mono text-[10px] tracking-[0.2em]">
                <button
                  onClick={() => setGender("men")}
                  className={`border px-3 py-2 transition ${gender === "men" ? "border-kaif-toxic text-kaif-toxic" : "border-white/15 text-kaif-chrome-dim hover:text-kaif-chrome"}`}
                >
                  MEN
                </button>
                <button
                  onClick={() => setGender("women")}
                  className={`border px-3 py-2 transition ${gender === "women" ? "border-kaif-toxic text-kaif-toxic" : "border-white/15 text-kaif-chrome-dim hover:text-kaif-chrome"}`}
                >
                  WOMEN
                </button>
              </div>
            </div>

            {/* category filter pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`border px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] uppercase transition ${
                    cat === c
                      ? "border-kaif-toxic bg-kaif-toxic/10 text-kaif-toxic"
                      : "border-white/15 text-kaif-chrome-dim hover:border-kaif-chrome hover:text-kaif-chrome"
                  }`}
                >
                  [ {c} ]
                </button>
              ))}
              <span className="ml-auto self-center font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
                {filtered.length.toString().padStart(2, "0")} PIECES
              </span>
            </div>

            {/* grid */}
            <motion.div
              layout
              className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.div
                    layout
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    onClick={() => setSelected(p)}
                    className="cursor-pointer"
                  >
                    <ProductCard
                      product={p}
                      hoverImage={
                        PRODUCTS[(PRODUCTS.indexOf(p) + 1) % PRODUCTS.length].image
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>
      )}

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/* ---------------- Split selector ---------------- */

function SplitSelector({ onSelect }: { onSelect: (g: "men" | "women") => void }) {
  const [hover, setHover] = useState<"men" | "women" | null>(null);

  return (
    <section className="relative flex min-h-screen w-full pt-16">
      {(["men", "women"] as const).map((g) => {
        const active = hover === g;
        const dim = hover && hover !== g;
        return (
          <button
            key={g}
            onMouseEnter={() => setHover(g)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect(g)}
            className="group relative flex-1 overflow-hidden transition-[flex] duration-500"
            style={{ flexGrow: active ? 1.25 : dim ? 0.75 : 1 }}
          >
            <motion.img
              src={g === "men" ? mensImg : womensImg}
              alt={
                g === "men"
                  ? "Male model in oversized dark streetwear in green-lit tunnel"
                  : "Female model in dark avant-garde streetwear, green rim light"
              }
              className="absolute inset-0 h-full w-full object-cover"
              animate={{
                scale: active ? 1.06 : 1,
                filter: active
                  ? "grayscale(0) brightness(0.9)"
                  : "grayscale(0.6) brightness(0.55)",
              }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              className="absolute inset-0"
              animate={{
                background: active
                  ? "linear-gradient(180deg, rgba(57,255,106,0.15) 0%, rgba(10,11,10,0.7) 100%)"
                  : "linear-gradient(180deg, rgba(10,11,10,0.5) 0%, rgba(10,11,10,0.85) 100%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="font-mono text-[10px] tracking-[0.5em] text-kaif-chrome-dim">
                {g === "men" ? "// 001" : "// 002"}
              </span>
              <motion.h2
                animate={{ letterSpacing: active ? "0.02em" : "-0.02em" }}
                className="font-display text-[clamp(4rem,10vw,10rem)] leading-none text-chrome"
              >
                {g === "men" ? "MEN" : "WOMEN"}
              </motion.h2>
              <span
                className={`mt-2 font-mono text-[10px] tracking-[0.4em] transition-colors ${
                  active ? "text-kaif-toxic" : "text-kaif-chrome-dim"
                }`}
              >
                {active ? "ENTER →" : "HOVER"}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
}

/* ---------------- Product modal ---------------- */

const SIZES = ["XS", "S", "M", "L", "XL"];

function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            onClose();
            setAdded(false);
            setSize(null);
          }}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-kaif-void/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid max-h-[90vh] w-full max-w-5xl grid-cols-1 overflow-auto border border-white/10 bg-kaif-black md:grid-cols-2"
          >
            <button
              onClick={() => {
                onClose();
                setAdded(false);
                setSize(null);
              }}
              className="absolute right-4 top-4 z-10 border border-white/20 bg-black/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.3em] text-kaif-chrome hover:border-kaif-toxic hover:text-kaif-toxic"
            >
              CLOSE ×
            </button>

            <div className="relative aspect-[4/5] bg-kaif-void">
              <img
                src={product.image}
                alt={product.alt}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-6 p-8 md:p-10">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
                  {product.sku} · {product.category.toUpperCase()}
                </p>
                <h3 className="mt-3 font-display text-4xl leading-none tracking-tight text-kaif-chrome md:text-5xl">
                  {product.name}
                </h3>
                <p className="mt-4 font-mono text-lg text-kaif-toxic">
                  €{product.price}
                </p>
              </div>

              <p className="max-w-md font-sans text-sm leading-relaxed text-kaif-chrome-dim">
                Cut heavy, worn heavier. Assembled in limited runs from
                mill-direct fabric. Once retired from the archive it will not
                return.
              </p>

              <div>
                <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
                  SIZE
                </p>
                <div className="flex gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`h-10 w-12 border font-mono text-xs transition ${
                        size === s
                          ? "border-kaif-toxic text-kaif-toxic"
                          : "border-white/15 text-kaif-chrome hover:border-kaif-chrome"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => size && setAdded(true)}
                disabled={!size}
                className={`mt-auto border py-4 font-mono text-xs tracking-[0.4em] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  added
                    ? "border-kaif-toxic bg-kaif-toxic text-kaif-black"
                    : "border-kaif-chrome text-kaif-chrome hover:border-kaif-toxic hover:text-kaif-toxic"
                }`}
              >
                {added ? "// SECURED" : "ADD TO BAG →"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
