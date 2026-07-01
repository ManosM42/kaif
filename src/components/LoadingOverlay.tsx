import { motion } from "framer-motion";
import logo from "@/assets/kaif-logo.jpg";
import { BarbedRing } from "./BarbedWire";

/** Full-screen route-transition curtain: shown ~800ms on every navigation. */
export function LoadingOverlay() {
  return (
    <motion.div
      key="kaif-loader"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-kaif-void scanline"
    >
      {/* wordmark stack */}
      <div className="relative flex items-center justify-center">
        <BarbedRing className="absolute h-[420px] w-[420px] drift-slow opacity-70" />

        <motion.div
          className="relative flex flex-col items-center gap-4"
          initial={{ opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            scale: 1.08,
            filter: "blur(6px)",
            transition: { duration: 0.25 },
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Lagging RGB-split copies of the logo */}
          <div className="relative h-[120px] w-[220px]">
            <motion.img
              src={logo}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain mix-blend-screen"
              style={{ filter: "hue-rotate(300deg) saturate(3) blur(1px)" }}
              initial={{ x: -8, opacity: 0 }}
              animate={{ x: -4, opacity: 0.55 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            />
            <motion.img
              src={logo}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain mix-blend-screen"
              style={{ filter: "hue-rotate(120deg) saturate(3) blur(1px)" }}
              initial={{ x: 8, opacity: 0 }}
              animate={{ x: 4, opacity: 0.55 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />
            <motion.img
              src={logo}
              alt="KAIF"
              className="relative h-full w-full object-contain breathe"
              
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              width={220}
              height={120}
            />
          </div>

          <motion.p
            className="font-mono text-[10px] tracking-[0.5em] text-kaif-chrome-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            KAIF // LOADING
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
