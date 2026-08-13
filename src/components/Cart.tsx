import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";

export function CartButton() {
  const { totalItems, open } = useCart();
  return (
    <button
      onClick={open}
      className="fixed right-5 top-24 z-[900] flex items-center gap-2 border border-white/20 bg-kaif-black/80 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-kaif-chrome backdrop-blur-sm hover:border-kaif-toxic hover:text-kaif-toxic"
    >
      BAG {totalItems > 0 && <span className="text-kaif-toxic">({totalItems})</span>}
    </button>
  );
}

export function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQuantity, totalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end bg-black/70 backdrop-blur-sm" onClick={close}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-kaif-black p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl text-kaif-chrome">ΤΣΑΝΤΑ</h2>
          <button onClick={close} className="font-mono text-xs text-kaif-chrome-dim hover:text-kaif-chrome">
            ΚΛΕΙΣΙΜΟ ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="font-mono text-xs text-kaif-chrome-dim">Η τσάντα σου είναι άδεια.</p>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-4 border-b border-white/10 pb-4">
                <img src={item.image} alt={item.name} className="h-20 w-20 flex-shrink-0 object-cover" />
                <div className="flex-1">
                  <p className="font-mono text-xs text-kaif-chrome">{item.name}</p>
                  <p className="font-mono text-[10px] text-kaif-chrome-dim">Μέγεθος: {item.size}</p>
                  <p className="font-mono text-xs text-kaif-toxic">€{item.price}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="h-6 w-6 border border-white/20 font-mono text-xs text-kaif-chrome-dim hover:border-white/40"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono text-xs text-kaif-chrome">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="h-6 w-6 border border-white/20 font-mono text-xs text-kaif-chrome-dim hover:border-white/40"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="ml-auto font-mono text-[10px] text-red-500 hover:underline"
                    >
                      ΑΦΑΙΡΕΣΗ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="mb-4 flex items-center justify-between font-mono text-sm text-kaif-chrome">
              <span>ΣΥΝΟΛΟ</span>
              <span className="text-kaif-toxic">€{totalPrice.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={close}
              className="block w-full border border-kaif-toxic py-4 text-center font-mono text-xs tracking-[0.3em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black"
            >
              ΟΛΟΚΛΗΡΩΣΗ ΑΓΟΡΑΣ →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}