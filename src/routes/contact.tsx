import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { BarbedWire } from "@/components/BarbedWire";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — KAIF" },
      {
        name: "description",
        content: "Contact KAIF. Studio in Berlin. Press, wholesale, general.",
      },
      { property: "og:title", content: "Contact — KAIF" },
      { property: "og:description", content: "Open a channel with the studio." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => setStatus("done"), 900);
  }

  return (
    <section className="relative min-h-screen px-5 pt-32 pb-24 md:px-10">
      <div className="mx-auto grid max-w-[1400px] gap-16 md:grid-cols-[1.1fr_1fr]">
        {/* Left: heading + address */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.4em] text-kaif-toxic">
            // 04 — CHANNEL
          </p>
          <h1 className="mt-6 font-display text-[clamp(3rem,8vw,8rem)] leading-[0.85] tracking-tight text-kaif-chrome">
            Say
            <br />
            <span className="text-chrome">something.</span>
          </h1>

          <div className="mt-16 grid gap-10 sm:grid-cols-2">
            <Block label="STUDIO">
              Köpenicker Str. 47
              <br />
              10179 Berlin
              <br />
              By appointment only
            </Block>
            <Block label="PRESS">
              press@kaif.archive
              <br />
              wholesale@kaif.archive
            </Block>
            <Block label="HOURS">
              THU–SAT
              <br />
              14:00 — 20:00 CET
            </Block>
            <Block label="SIGNALS">
              IG · @kaif.archive
              <br />
              TT · @kaif.wire
            </Block>
          </div>
        </div>

        {/* Right: form */}
        <div className="relative border border-white/10 p-6 md:p-10">
          {/* barbed corners */}
          <Corner className="top-0 left-0" />
          <Corner className="top-0 right-0 rotate-90" />
          <Corner className="bottom-0 right-0 rotate-180" />
          <Corner className="bottom-0 left-0 -rotate-90" />

          <p className="font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
            TRANSMIT / 001
          </p>

          <AnimatePresence mode="wait">
            {status !== "done" ? (
              <motion.form
                key="form"
                exit={{ opacity: 0, filter: "blur(8px)" }}
                onSubmit={submit}
                className="mt-8 space-y-8"
              >
                <Field
                  label="NAME"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Field
                  label="EMAIL"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
                <Field
                  label="MESSAGE"
                  multiline
                  value={form.message}
                  onChange={(v) => setForm({ ...form, message: v })}
                />

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="glitch-hover w-full border border-kaif-chrome py-4 font-mono text-xs tracking-[0.4em] text-kaif-chrome transition hover:border-kaif-toxic hover:text-kaif-toxic disabled:opacity-50"
                >
                  {status === "sending" ? "// SENDING" : "TRANSMIT →"}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.7 }}
                className="mt-16 flex flex-col items-center py-16 text-center"
              >
                <motion.span
                  initial={{ letterSpacing: "0.5em", opacity: 0 }}
                  animate={{ letterSpacing: "0.2em", opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="font-mono text-xs tracking-[0.4em] text-kaif-toxic"
                >
                  // SIGNAL RECEIVED
                </motion.span>
                <h3 className="mt-6 font-display text-4xl leading-none tracking-tight text-chrome md:text-5xl">
                  We'll respond
                  <br />
                  when we respond.
                </h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
}) {
  const shared =
    "w-full bg-transparent border-b border-white/20 py-3 font-mono text-sm text-kaif-chrome outline-none transition focus:border-kaif-toxic";
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.3em] text-kaif-chrome-dim">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={4}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} mt-2 resize-none`}
        />
      ) : (
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} mt-2`}
        />
      )}
    </label>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-kaif-toxic">
        {label}
      </p>
      <p className="font-mono text-sm leading-relaxed text-kaif-chrome">
        {children}
      </p>
    </div>
  );
}

function Corner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute h-8 w-8 ${className}`}
      aria-hidden
    >
      <BarbedWire className="h-full w-full text-kaif-toxic opacity-70" animated={false} />
    </div>
  );
}
