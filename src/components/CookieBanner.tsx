import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("kaif_cookies_accepted");
    if (!accepted) {
      setIsVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("kaif_cookies_accepted", "true");
    setIsVisible(false);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 z-[2000] w-full border-t border-white/10 bg-kaif-black p-4 backdrop-blur-md"
        >
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-kaif-chrome-dim text-center md:text-left">
              This site uses cookies to enhance your experience. By continuing to browse, you agree to our use of cookies.
            </p>
            <button
              onClick={handleAccept}
              className="border border-kaif-toxic px-6 py-2 font-mono text-[10px] tracking-[0.3em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black transition-colors"
            >
              ACCEPT →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
