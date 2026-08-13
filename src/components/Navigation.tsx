import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import logo from "@/assets/kaif-logo.jpg";

const links = [
  { to: "/", label: "Home", n: "01" },
  { to: "/clothing", label: "Clothing", n: "02" },
  { to: "/about", label: "About", n: "03" },
  { to: "/contact", label: "Contact", n: "04" },
] as const;

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(10,11,10,0.85)" : "rgba(10,11,10,0)",
          borderBottomColor: scrolled
            ? "rgba(232,234,230,0.10)"
            : "rgba(232,234,230,0)",
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-0 top-0 z-[1000] border-b backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="KAIF home">
            <img
              src={logo}
              alt="KAIF"
              width={48}
              height={26}
              className="h-6 w-auto md:h-7"
              
            />
            <span className="hidden font-mono text-[10px] tracking-[0.35em] text-kaif-chrome-dim md:inline">
              ARCHIVE — 001
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="group relative font-mono text-[11px] tracking-[0.3em] uppercase text-kaif-chrome transition-colors"
                >
                  <span className="mr-2 text-kaif-chrome-dim">{l.n}</span>
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-kaif-toxic transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                    style={{ boxShadow: "0 0 8px var(--kaif-toxic)" }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden font-mono text-[11px] tracking-[0.3em] uppercase text-kaif-chrome"
            aria-label="Open menu"
          >
            Menu +
          </button>
        </div>
      </motion.header>

      {/* Mobile takeover */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1001] flex flex-col bg-kaif-void md:hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 hairline-bottom">
            <span className="font-mono text-[10px] tracking-[0.35em] text-kaif-chrome-dim">
              MENU
            </span>
            <button
              onClick={() => setOpen(false)}
              className="font-mono text-[11px] tracking-[0.3em] text-kaif-chrome"
              aria-label="Close menu"
            >
              Close ×
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-8 px-8">
            {links.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="glitch-hover flex items-baseline gap-4"
                >
                  <span className="font-mono text-xs text-kaif-toxic">{l.n}</span>
                  <span className="font-display text-6xl tracking-tight text-kaif-chrome">
                    {l.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>
      )}
    </>
  );
}
