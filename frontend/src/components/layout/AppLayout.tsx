import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OPENING_DURATION_MS = 3000;

export default function AppLayout() {
  const location = useLocation();
  const [isOpening, setIsOpening] = useState(true);
  const openingTimer = useRef<number | null>(null);

  useEffect(() => {
    function playOpening() {
      setIsOpening(true);
      if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
      openingTimer.current = window.setTimeout(() => {
        setIsOpening(false);
        openingTimer.current = null;
      }, OPENING_DURATION_MS);
    }

    playOpening();

    // A PWA may be launched into an already-running app window. In that
    // case React does not remount, so replay the opening sequence explicitly.
    const launchQueue = (window as Window & {
      launchQueue?: { setConsumer: (consumer: (params: unknown) => void) => void };
    }).launchQueue;
    launchQueue?.setConsumer(() => playOpening());

    window.addEventListener("pageshow", playOpening);
    return () => {
      window.removeEventListener("pageshow", playOpening);
      if (openingTimer.current !== null) window.clearTimeout(openingTimer.current);
    };
  }, []);

  return (
    <div className="app-shell flex min-h-screen flex-col bg-bg-primary">
      <Navbar />
      <main className="flex-1">
        <div key={location.pathname} className="route-entry">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <Footer />

      {isOpening && (
        <div className="app-opening" role="status" aria-label="Opening Anteiku">
          <div className="app-opening__grid" aria-hidden />
          <div className="app-opening__beam app-opening__beam--one" aria-hidden />
          <div className="app-opening__beam app-opening__beam--two" aria-hidden />
          <div className="app-opening__orbit app-opening__orbit--outer" aria-hidden />
          <div className="app-opening__orbit app-opening__orbit--inner" aria-hidden />
          <div className="app-opening__halo" aria-hidden />
          <div className="app-opening__scene relative flex flex-col items-center gap-3">
            <div className="app-opening__mark"><span aria-hidden /></div>
            <Sparkles size={16} className="animate-pulse text-sage" aria-hidden />
            <p className="font-serif text-lg tracking-[0.28em] text-ivory">ANTEIKU</p>
            <p className="app-opening__tagline text-[0.58rem] uppercase tracking-[0.38em] text-muted">Getting time to shine</p>
          </div>
        </div>
      )}
    </div>
  );
}
