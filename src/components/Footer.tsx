import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { BarbedWire } from "./BarbedWire";

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="relative mt-32 border-t border-white/10 bg-kaif-void px-5 py-16 md:px-10">
      <BarbedWire className="absolute -top-[1px] left-0 h-[24px] w-full text-kaif-chrome-dim opacity-40" />

      <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-4xl leading-none text-chrome">
            KAIF
          </h3>
          <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-kaif-chrome-dim">
            Uniform for the disaffected. Fabricated in limited runs.
            When it's gone it stays gone.
          </p>
        </div>

        <div>
          <p className="mb-4 font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
            NAVIGATE
          </p>
          <ul className="space-y-2 font-mono text-xs">
            {[
              ["/", "Index"],
              ["/clothing", "Clothing"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-kaif-chrome transition-colors hover:text-kaif-toxic"
                >
                  → {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
            TRANSMISSION
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSent(true);
            }}
            className="space-y-3"
          >
            <div className="flex items-center border border-white/15 bg-black/50 px-3 py-2 focus-within:border-kaif-toxic">
              <span className="mr-2 font-mono text-xs text-kaif-toxic">$</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter.email"
                className="w-full bg-transparent font-mono text-xs text-kaif-chrome outline-none placeholder:text-kaif-chrome-dim"
                aria-label="Email"
              />
            </div>
            <button
              type="submit"
              className="glitch-hover font-mono text-[10px] tracking-[0.3em] text-kaif-chrome hover:text-kaif-toxic"
            >
              {sent ? "// ACCEPTED" : "SUBSCRIBE →"}
            </button>
          </form>

          <div className="mt-8 flex gap-4 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
            <a href="#" className="hover:text-kaif-toxic">IG</a>
            <a href="#" className="hover:text-kaif-toxic">TT</a>
            <a href="#" className="hover:text-kaif-toxic">XX</a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1600px] items-center justify-between border-t border-white/5 pt-6 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim">
        <span>© KAIF MMXXVI</span>
        <span>NO REFUNDS · NO APOLOGIES</span>
      </div>
    </footer>
  );
}
