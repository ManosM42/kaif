import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { finalizeOrder, getCheckoutSessionStatus } from "@/lib/checkout.functions";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/checkout/success")({
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  const { clear } = useCart();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [orderInfo, setOrderInfo] = useState<{ email: string | null; amount: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    (async () => {
      try {
        const info = await getCheckoutSessionStatus({ data: { sessionId } });
        if (info.paymentStatus !== "paid") {
          setStatus("error");
          return;
        }
        await finalizeOrder({ data: { sessionId } });
        clear();
        setOrderInfo({ email: info.customerEmail, amount: info.amountTotal });
        setStatus("ok");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kaif-black font-mono text-xs tracking-[0.3em] text-kaif-chrome-dim">
        ΕΠΙΒΕΒΑΙΩΣΗ ΠΛΗΡΩΜΗΣ...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-kaif-black px-4 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-red-500">
          ΚΑΤΙ ΠΗΓΕ ΣΤΡΑΒΑ ΜΕ ΤΗΝ ΠΛΗΡΩΜΗ
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="border border-kaif-toxic px-6 py-3 font-mono text-xs tracking-[0.2em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black"
        >
          ΕΠΙΣΤΡΟΦΗ ΣΤΗΝ ΑΡΧΙΚΗ
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-kaif-black px-4 text-center text-white">
      <h1 className="font-display text-4xl text-chrome">ΕΥΧΑΡΙΣΤΟΥΜΕ</h1>
      <p className="font-mono text-xs tracking-[0.2em] text-kaif-chrome-dim">
        Η παραγγελία σου επιβεβαιώθηκε.
      </p>
      {orderInfo?.amount && (
        <p className="font-mono text-sm text-kaif-toxic">€{orderInfo.amount.toFixed(2)}</p>
      )}
      
       <a href="/"
        className="mt-4 border border-white/20 px-6 py-3 font-mono text-xs tracking-[0.2em] text-kaif-chrome-dim hover:border-kaif-chrome hover:text-kaif-chrome"
      >
        ΣΥΝΕΧΙΣΕ ΤΙΣ ΑΓΟΡΕΣ →
      </a>
    </div>
  );
}