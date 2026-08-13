import { motion } from "framer-motion";
import type { Product } from "@/lib/products";

type Props = {
  product: Product;
  hoverImage?: string;
  className?: string;
  aspect?: "portrait" | "tall" | "wide";
};

export function ProductCard({
  product,
  hoverImage,
  className = "",
  aspect = "portrait",
}: Props) {
  const ratio =
    aspect === "tall" ? "aspect-[3/5]" : aspect === "wide" ? "aspect-[5/4]" : "aspect-[4/5]";

  return (
    <motion.a
      href="#"
      onClick={(e) => e.preventDefault()}
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={`group relative block ${className}`}
    >
      <div className={`relative overflow-hidden bg-kaif-void ${ratio}`}>
        <motion.img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          variants={{
            rest: { scale: 1, filter: "grayscale(0.1)" },
            hover: { scale: 1.04, filter: "grayscale(0)" },
          }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        />
        {hoverImage && (
          <motion.img
            src={hoverImage}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            variants={{
              rest: { opacity: 0, x: 20, filter: "blur(6px)" },
              hover: { opacity: 1, x: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.35 }}
          />
        )}

        {/* glitch RGB split overlay on hover */}
        <motion.div
          aria-hidden
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 },
          }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, transparent 48%, rgba(57,255,106,0.15) 50%, transparent 52%, transparent 100%)",
            mixBlendMode: "screen",
          }}
        />

        {/* SKU tag */}
        <div className="absolute left-3 top-3 border border-white/20 bg-black/60 px-2 py-1 font-mono text-[9px] tracking-widest text-kaif-chrome-dim backdrop-blur-sm">
          {product.sku}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-kaif-chrome">
          {product.name}
        </span>
        <span className="font-mono text-xs text-kaif-chrome-dim">
          €{product.price}
        </span>
      </div>
    </motion.a>
  );
}
