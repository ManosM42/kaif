import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
// ⚠️ Change this path to wherever your checkout functions file lives
import { getCheckoutSessionStatus, finalizeOrder } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutSuccessPage,
});

/* ------------------------------------------------------------------ */
/*  Edit the texts here                                                */
/* ------------------------------------------------------------------ */
const TEXT = {
  loading: "Επιβεβαίωση πληρωμής…",
  successTitle: "Η πληρωμή ολοκληρώθηκε",
  successBody:
    "Ευχαριστούμε για την παραγγελία σας! Θα λάβετε σύντομα email με τις πληροφορίες αποστολής.",
  successButton: "Συνέχεια στο κατάστημα",
  failedTitle: "Η πληρωμή δεν πραγματοποιήθηκε",
  failedUnpaid: "Δεν έγινε καμία χρέωση. Μπορείτε να ξαναδοκιμάσετε από το ταμείο.",
  failedError:
    "Δεν καταφέραμε να επιβεβαιώσουμε την πληρωμή. Αν έχει γίνει χρέωση, θα λάβετε email επιβεβαίωσης.",
  failedButton: "Επιστροφή στο ταμείο",
  amount: "Ποσό",
  email: "Επιβεβαίωση σε",
};

type ViewState =
  | { kind: "loading" }
  | { kind: "success"; email: string | null; amount: number; currency: string }
  | { kind: "failed"; reason: "unpaid" | "error" };

function CheckoutSuccessPage() {
  const { session_id } = Route.useSearch();
  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const ranFor = useRef<string | null>(null);

  useEffect(() => {
    if (!session_id) {
      setView({ kind: "failed", reason: "unpaid" });
      return;
    }
    // Prevents running twice (React StrictMode) and creating a duplicate order
    if (ranFor.current === session_id) return;
    ranFor.current = session_id;

    (async () => {
      try {
        const status = await getCheckoutSessionStatus({ data: { sessionId: session_id } });

        if (status.status !== "complete" || status.paymentStatus !== "paid") {
          setView({ kind: "failed", reason: "unpaid" });
          return;
        }

        // Saves the order for the admin panel (safe to call more than once)
        try {
          await finalizeOrder({ data: { sessionId: session_id } });
        } catch (err) {
          // The customer HAS paid, so we still show success. Log it so you can spot it.
          // A Stripe webhook is the reliable backup for this case.
          console.error("finalizeOrder failed:", err);
        }

        // TODO: clear the cart here, e.g. clearCart();

        setView({
          kind: "success",
          email: status.customerEmail,
          amount: status.amountTotal,
          currency: status.currency ?? "eur",
        });
      } catch (err) {
        console.error("Checkout status error:", err);
        setView({ kind: "failed", reason: "error" });
      }
    })();
  }, [session_id]);

  return (
    <main className="cs-wrap">
      <style>{CSS}</style>
      <div className="cs-inner">
        {view.kind === "loading" && (
          <>
            <svg className="cs-icon" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="cs-track" cx="60" cy="60" r="52" />
              <circle className="cs-spin" cx="60" cy="60" r="52" />
            </svg>
            <p className="cs-body" role="status" aria-live="polite">
              {TEXT.loading}
            </p>
          </>
        )}

        {view.kind === "success" && (
          <>
            <svg className="cs-icon cs-ok" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="cs-pulse" cx="60" cy="60" r="56" />
              <circle className="cs-ring" cx="60" cy="60" r="52" />
              <path className="cs-mark" d="M38 62 L54 78 L84 44" />
            </svg>
            <div className="cs-text" role="status" aria-live="polite">
              <h1 className="cs-title">{TEXT.successTitle}</h1>
              <p className="cs-body">{TEXT.successBody}</p>

              <dl className="cs-details">
                <div>
                  <dt>{TEXT.amount}</dt>
                  <dd>{formatMoney(view.amount, view.currency)}</dd>
                </div>
                {view.email && (
                  <div>
                    <dt>{TEXT.email}</dt>
                    <dd>{view.email}</dd>
                  </div>
                )}
              </dl>

              <Link to="/" className="cs-button">
                {TEXT.successButton}
              </Link>
            </div>
          </>
        )}

        {view.kind === "failed" && (
          <>
            <svg className="cs-icon cs-bad" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="cs-ring" cx="60" cy="60" r="52" />
              <path className="cs-mark" d="M44 44 L76 76" />
              <path className="cs-mark cs-mark-2" d="M76 44 L44 76" />
            </svg>
            <div className="cs-text" role="alert">
              <h1 className="cs-title">{TEXT.failedTitle}</h1>
              <p className="cs-body">
                {view.reason === "error" ? TEXT.failedError : TEXT.failedUnpaid}
              </p>
              <Link to="/checkout" className="cs-button">
                {TEXT.failedButton}
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("el-GR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/* ------------------------------------------------------------------ */
/*  Styles (scoped with the "cs-" prefix, no Tailwind needed)          */
/*  Change the two colors below to match your brand                    */
/* ------------------------------------------------------------------ */
const CSS = `
.cs-wrap {
  --cs-ok: #1b7a4b;
  --cs-bad: #c62f2f;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
  font-family: inherit;
}
.cs-inner { width: 100%; max-width: 26rem; }

.cs-icon { display: block; width: 120px; height: 120px; margin: 0 auto 2rem; overflow: visible; }
.cs-ok  { color: var(--cs-ok); }
.cs-bad { color: var(--cs-bad); animation: cs-shake .4s ease-in-out 1.1s; }

.cs-icon circle, .cs-icon path { stroke: currentColor; fill: none; stroke-linecap: round; stroke-linejoin: round; }

.cs-ring {
  stroke-width: 4;
  stroke-dasharray: 327;
  stroke-dashoffset: 327;
  transform: rotate(-90deg);
  transform-origin: 60px 60px;
  animation: cs-draw .7s cubic-bezier(.65, 0, .35, 1) forwards;
}
.cs-mark {
  stroke-width: 5;
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
  animation: cs-draw .4s ease-out .65s forwards;
}
.cs-mark-2 { animation-delay: .85s; }

.cs-pulse {
  stroke-width: 2;
  opacity: 0;
  transform-origin: 60px 60px;
  animation: cs-pulse .9s ease-out 1s forwards;
}

.cs-track { stroke: currentColor; stroke-width: 4; opacity: .12; }
.cs-spin {
  stroke-width: 4;
  stroke-dasharray: 80 247;
  opacity: .6;
  transform-origin: 60px 60px;
  animation: cs-rotate 1s linear infinite;
}

.cs-text { animation: cs-fade .5s ease-out 1s both; }
.cs-title { margin: 0 0 .75rem; font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 600; letter-spacing: -0.01em; line-height: 1.2; }
.cs-body  { margin: 0 auto; max-width: 24rem; line-height: 1.6; opacity: .8; }

.cs-details { margin: 2rem 0 0; text-align: left; border-top: 1px solid rgba(128, 128, 128, .3); }
.cs-details div { display: flex; justify-content: space-between; gap: 1rem; padding: .85rem 0; border-bottom: 1px solid rgba(128, 128, 128, .3); font-size: .95rem; }
.cs-details dt { opacity: .65; }
.cs-details dd { margin: 0; font-weight: 500; overflow-wrap: anywhere; text-align: right; }

.cs-button {
  display: inline-block;
  margin-top: 2rem;
  padding: .8rem 1.75rem;
  border: 1px solid currentColor;
  color: inherit;
  text-decoration: none;
  font-weight: 500;
  transition: opacity .15s;
}
.cs-button:hover { opacity: .65; }
.cs-button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }

@keyframes cs-draw   { to { stroke-dashoffset: 0; } }
@keyframes cs-rotate { to { transform: rotate(360deg); } }
@keyframes cs-fade   { from { opacity: 0; } to { opacity: 1; } }
@keyframes cs-pulse  { from { opacity: .35; transform: scale(1); } to { opacity: 0; transform: scale(1.35); } }
@keyframes cs-shake  { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

@media (prefers-reduced-motion: reduce) {
  .cs-ring, .cs-mark { animation: none; stroke-dashoffset: 0; }
  .cs-pulse, .cs-text, .cs-spin, .cs-icon.cs-bad { animation: none; }
  .cs-pulse { opacity: 0; }
}
`;