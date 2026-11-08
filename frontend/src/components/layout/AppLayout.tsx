import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useEffect, useRef, useState } from "react";

const OPENING_DURATION_MS = 5000;

export default function AppLayout() {
  const location = useLocation();
  const [isOpening, setIsOpening] = useState(true);
  const [openingKey, setOpeningKey] = useState(0);
  const openingTimer = useRef<number | null>(null);

  useEffect(() => {
    function playOpening() {
      setOpeningKey((key) => key + 1);
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
    <>
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
      </div>

      {isOpening && (
        <div key={openingKey} className="app-opening" role="status" aria-label="Opening Anteiku">
          <div className="app-opening__mist" aria-hidden />
          <div className="app-opening__warmth" aria-hidden />
          <svg className="app-opening__brush" viewBox="0 0 512 512" aria-hidden="true">
            <path className="app-opening__brush-main" d="M257 48C355 47 432 118 452 210c21 98-30 194-118 236-85 41-192 16-248-57C30 317 33 216 84 140 124 80 183 48 257 48Z" />
            <path className="app-opening__brush-dry" d="M244 55C153 57 84 108 53 187m-4 87c2 74 40 141 105 180m69 30c86 9 166-31 209-99m25-88c8-74-20-145-79-194" />
          </svg>
          <span className="app-opening__petal app-opening__petal--lead" aria-hidden />
          <span className="app-opening__petal app-opening__petal--echo-one" aria-hidden />
          <span className="app-opening__petal app-opening__petal--echo-two" aria-hidden />
          <span className="app-opening__petal app-opening__petal--final" aria-hidden />
          <div className="app-opening__scene">
            <img className="app-opening__emblem" src="/anteiku-emblem.png" alt="" />
            <img className="app-opening__wordmark" src="/anteiku-wordmark.png" alt="" />
            <img className="app-opening__ornament" src="/anteiku-ornament.png" alt="" />
          </div>
        </div>
      )}
    </>
  );
}
