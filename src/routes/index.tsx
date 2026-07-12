import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import logo from "@/assets/kaif-logo.jpg";
import lookbook from "@/assets/lookbook-hero.jpg";
import { BarbedRing, BarbedWire } from "@/components/BarbedWire";
import { ProductCard } from "@/components/ProductCard";
import { listProducts } from "@/lib/products.functions";

export const Route = createFileRoute("/")({
  loader: async () => (await listProducts()).products,
  component: Home,
});

function Home() {
  const products = Route.useLoaderData();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const logoY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const logoScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 0]);

  const lookbookRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: lbProgress } = useScroll({
    target: lookbookRef,
    offset: ["start end", "end start"],
  });
  const lbY = useTransform(lbProgress, [0, 1], [-80, 80]);

  if (products.length < 4) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kaif-black px-4 text-center font-mono text-xs tracking-[0.3em] text-kaif-chrome-dim">
        ADD AT LEAST 4 PRODUCTS IN ADMIN
      </div>
    );
  }

  const featured = products.slice(0, 4);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-kaif-black"
      >
        {/* ambient breathing green glow */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        >
          <div
            className="breathe h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(57,255,106,0.30) 0%, rgba(14,77,38,0.15) 40%, transparent 70%)",
            }}
          />
        </motion.div>

        {/* drifting barbed rings */}
        <BarbedRing className="pointer-events-none absolute h-[640px] w-[640px] drift-slow opacity-40" />
        <BarbedRing className="pointer-events-none absolute h-[820px] w-[820px] drift-reverse opacity-20" />

        {/* Tiny SKU markers */}
        <div className="pointer-events-none absolute left-6 top-24 font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim md:left-10 md:top-28">
          <div>N.51.24°</div>
          <div className="mt-1">E.09.99°</div>
        </div>
        <div className="pointer-events-none absolute right-6 top-24 text-right font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim md:right-10 md:top-28">
          <div>DROP / 001</div>
          <div className="mt-1">FW / MMXXVI</div>
        </div>

        {/* wordmark */}
        <motion.div
          style={{ y: logoY, scale: logoScale }}
          className="relative z-10 flex flex-col items-center"
        >
          <img
            src={logo}
            alt="KAIF logo"
            width={520}
            height={280}
            className="breathe h-auto w-[68vw] max-w-[560px] select-none"
          />
          <p className="mt-8 max-w-md text-center font-mono text-[11px] leading-relaxed tracking-[0.25em] text-kaif-chrome-dim">
            UNIFORM FOR THE DISAFFECTED · FABRICATED IN LIMITED RUNS
          </p>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-kaif-chrome-dim"
        >
          ↓ SCROLL
        </motion.div>
      </section>

      {/* ---------- MANIFESTO ---------- */}
      <section className="relative border-y border-white/5 py-32 md:py-48">
        <BarbedWire className="absolute -top-3 left-0 h-6 w-full text-kaif-chrome-dim opacity-30" />
        <BarbedWire className="absolute -bottom-3 left-0 h-6 w-full text-kaif-chrome-dim opacity-30" />

        <div className="mx-auto max-w-[1200px] px-5 md:px-10">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic"
          >
            // 01 — DOCTRINE
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-8 font-display text-[clamp(2.5rem,7vw,7rem)] leading-[0.9] tracking-tight text-kaif-chrome"
          >
            Nothing sacred.
            <br />
            <span className="text-chrome">Everything sharp.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 max-w-xl font-sans text-lg leading-relaxed text-kaif-chrome-dim"
          >
            We do not soften. We do not scale. Each piece is built to survive the
            room it enters — then leave a mark on the way out.
          </motion.p>
        </div>
      </section>

      {/* ---------- FEATURED DROPS ---------- */}
      <section className="relative py-32 px-5 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
                // 02 — CURRENT RUN
              </p>
              <h2 className="mt-4 font-display text-5xl leading-none tracking-tight text-kaif-chrome md:text-7xl">
                Featured Drops
              </h2>
            </div>
            <span className="hidden font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim md:inline">
              04 / OF 12
            </span>
          </div>

          {/* Asymmetric editorial grid */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="col-span-12 md:col-span-7"
            >
              <ProductCard product={featured[0]} hoverImage={featured[1].image} aspect="wide" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="col-span-6 md:col-span-5 md:mt-24"
            >
              <ProductCard product={featured[1]} hoverImage={featured[2].image} aspect="tall" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="col-span-6 md:col-span-4"
            >
              <ProductCard product={featured[2]} hoverImage={featured[3].image} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="col-span-12 md:col-span-8 md:mt-16"
            >
              <ProductCard product={featured[3]} hoverImage={featured[0].image} aspect="wide" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- EDITORIAL LOOKBOOK ---------- */}
      <section
        ref={lookbookRef}
        className="relative my-32 h-[80vh] w-full overflow-hidden"
      >
        <motion.img
          src={lookbook}
          alt="KAIF FW26 editorial — model in oversized black jacket in industrial space"
          loading="lazy"
          style={{ y: lbY }}
          className="absolute inset-0 h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kaif-black via-transparent to-kaif-black/50" />
        <div className="relative flex h-full items-end px-5 pb-12 md:px-10">
          <div>
            <p className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
              // 03 — LOOKBOOK FW / MMXXVI
            </p>
            <h3 className="mt-3 font-display text-5xl leading-none tracking-tight text-chrome md:text-7xl">
              After the Signal
            </h3>
          </div>
        </div>
      </section>
    </>
  );
}