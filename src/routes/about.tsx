import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import aboutImg from "@/assets/about-story.jpg";
import lookbook from "@/assets/lookbook-hero.jpg";
import mensImg from "@/assets/men-split.jpg";
import { BarbedWire } from "@/components/BarbedWire";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — KAIF" },
      {
        name: "description",
        content:
          "The story of KAIF. Founded on barbed wire, chrome and the light between transmissions.",
      },
      { property: "og:title", content: "About — KAIF" },
      {
        property: "og:description",
        content:
          "Chapters from the archive. How KAIF came to look the way it does.",
      },
    ],
  }),
  component: About,
});

const CHAPTERS = [
  {
    n: "01",
    title: "From the noise",
    img: aboutImg,
    body:
      "KAIF started in an unlit warehouse north of the city. Not as a brand — as a room of unfinished garments and a policy of never explaining anything twice. What survived the first winter became the archive.",
  },
  {
    n: "02",
    title: "Chrome & wire",
    img: lookbook,
    body:
      "The barbed loop was drawn once and never edited. We treat every collection like the same object under different light — same wire, same chrome, different weather.",
  },
  {
    n: "03",
    title: "Nothing repeats",
    img: mensImg,
    body:
      "Every run is bound. When the count hits zero the file closes and the pattern is destroyed. There is no restock, no reissue, no polite second life on a resale platform we bless.",
  },
];

const PILLARS = [
  { n: "01", title: "Hard silhouette", body: "Volume without apology. Cut for presence, not politeness." },
  { n: "02", title: "Mill-direct fabric", body: "Sourced from three houses. Nothing off the shelf, nothing branded." },
  { n: "03", title: "Sealed archive", body: "Runs are numbered, then closed. Patterns are physically destroyed." },
  { n: "04", title: "No campaign", body: "We do not chase virality. The garment is the campaign." },
];

function About() {
  return (
    <>
      {/* Intro */}
      <section className="relative min-h-[70vh] px-5 pt-40 pb-20 md:px-10">
        <div className="mx-auto max-w-[1200px]">
          <p className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
            // ABOUT — DOSSIER 001
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1 }}
            className="mt-6 font-display text-[clamp(3rem,10vw,10rem)] leading-[0.85] tracking-tight text-kaif-chrome"
          >
            We build for
            <br />
            <span className="text-chrome">the room after.</span>
          </motion.h1>
          <p className="mt-10 max-w-xl font-sans text-lg leading-relaxed text-kaif-chrome-dim">
            KAIF is a closed archive of garments designed to enter loud and
            leave permanent. Read the chapters below, or don't.
          </p>
        </div>
        <BarbedWire className="absolute bottom-0 left-0 h-6 w-full text-kaif-chrome-dim opacity-30" />
      </section>

      {/* Chapters */}
      {CHAPTERS.map((c, i) => (
        <Chapter key={c.n} chapter={c} reverse={i % 2 === 1} />
      ))}

      {/* Pillars */}
      <section className="relative border-t border-white/10 px-5 py-32 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <p className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
            // OPERATING PRINCIPLES
          </p>
          <h2 className="mt-4 font-display text-5xl leading-none tracking-tight text-kaif-chrome md:text-7xl">
            Four rules.
          </h2>

          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="group flex gap-6 bg-kaif-black p-8 md:p-12"
              >
                <span className="font-mono text-xs tracking-[0.3em] text-kaif-toxic">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-display text-3xl leading-none tracking-tight text-kaif-chrome">
                    {p.title}
                  </h3>
                  <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-kaif-chrome-dim">
                    {p.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Chapter({
  chapter,
  reverse,
}: {
  chapter: (typeof CHAPTERS)[number];
  reverse: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      className="relative border-t border-white/10 px-5 py-24 md:px-10 md:py-40"
    >
      <div
        className={`mx-auto grid max-w-[1400px] items-center gap-10 md:grid-cols-2 md:gap-16 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-kaif-void">
          <motion.img
            src={chapter.img}
            alt=""
            aria-hidden
            loading="lazy"
            style={{ y }}
            className="absolute inset-0 h-[120%] w-full object-cover"
          />
        </div>

        <motion.div style={{ y: textY }}>
          <span className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
            CHAPTER {chapter.n}
          </span>
          <h3 className="mt-6 font-display text-5xl leading-none tracking-tight text-kaif-chrome md:text-7xl">
            {chapter.title}
          </h3>
          <p className="mt-8 max-w-md font-sans text-base leading-relaxed text-kaif-chrome-dim md:text-lg">
            {chapter.body}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
