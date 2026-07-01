import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { GrainOverlay } from "../components/GrainOverlay";
import { LoadingOverlay } from "../components/LoadingOverlay";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-kaif-black px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-chrome">404</h1>
        <p className="mt-4 font-mono text-xs tracking-[0.3em] text-kaif-chrome-dim">
          SIGNAL LOST
        </p>
        <Link
          to="/"
          className="mt-8 inline-block border border-kaif-toxic px-6 py-3 font-mono text-xs tracking-[0.3em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black"
        >
          RETURN →
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-kaif-black px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl text-chrome">SYSTEM FAULT</h1>
        <p className="mt-4 font-mono text-xs text-kaif-chrome-dim">
          The transmission was interrupted.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-8 border border-kaif-toxic px-6 py-3 font-mono text-xs tracking-[0.3em] text-kaif-toxic hover:bg-kaif-toxic hover:text-kaif-black"
        >
          RETRY →
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KAIF — Uniform for the Disaffected" },
      {
        name: "description",
        content:
          "KAIF. Luxury streetwear built on barbed wire and chrome. Limited-run outerwear, tops, bottoms and accessories.",
      },
      { property: "og:title", content: "KAIF — Uniform for the Disaffected" },
      {
        property: "og:description",
        content:
          "Dark luxury streetwear. Limited runs. Chrome, barbed wire, and toxic light.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AnimatedShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isNavigating, setIsNavigating] = useState(false);
  const [displayedPath, setDisplayedPath] = useState(pathname);

  useEffect(() => {
  if (pathname === displayedPath) return;

  setIsNavigating(true);
  const t1 = setTimeout(() => setDisplayedPath(pathname), 500);
  const t2 = setTimeout(() => setIsNavigating(false), 850);

  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pathname]);

  return (
    <>
      <Navigation />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={displayedPath}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <GrainOverlay />
      <AnimatePresence>{isNavigating && <LoadingOverlay />}</AnimatePresence>
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatedShell />
    </QueryClientProvider>
  );
}
