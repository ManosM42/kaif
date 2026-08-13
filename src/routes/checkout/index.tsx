import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import { createCheckoutSession } from "@/lib/checkout.functions";

export const Route = createFileRoute("/checkout/")({
  component: CheckoutPage,
});

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

function CheckoutPage() {
  const { items } = useCart();

  const fetchClientSecret = useMemo(() => {
    return async () => {
      const res = await createCheckoutSession({
        data: {
          items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        },
      });
      if (!res.clientSecret) throw new Error("Αποτυχία δημιουργίας checkout session");
      return res.clientSecret;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kaif-black px-4 text-center font-mono text-xs tracking-[0.3em] text-kaif-chrome-dim">
        Η ΤΣΑΝΤΑ ΣΟΥ ΕΙΝΑΙ ΑΔΕΙΑ
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kaif-black px-4 py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-10 font-display text-4xl text-kaif-chrome">ΟΛΟΚΛΗΡΩΣΗ ΑΓΟΡΑΣ</h1>
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}