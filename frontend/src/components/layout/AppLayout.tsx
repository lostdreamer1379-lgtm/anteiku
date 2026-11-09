import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Globe2, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";

const OPENING_DURATION_MS = 5000;
const WORLDS_URL = "https://frontend-worlds.vercel.app/";
const WORLDS_TRANSITION_MS = 1900;

export default function AppLayout() {
  const location = useLocation();
  const [isOpening, setIsOpening] = useState(true);
  const [openingKey, setOpeningKey] = useState(0);
  const [enteringWorlds, setEnteringWorlds] = useState(false);
  const openingTimer = useRef<number | null>(null);
  const worldsTimer = useRef<number | null>(null);

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
      if (worldsTimer.current !== null) window.clearTimeout(worldsTimer.current);
    };
  }, []);

  useEffect(() => {
    // If the browser restores Anteiku from the back-forward cache after the
    // external Worlds page, never leave the launch curtain stuck open.
    function resetWorldsTransition() {
      setEnteringWorlds(false);
      if (worldsTimer.current !== null) {
        window.clearTimeout(worldsTimer.current);
        worldsTimer.current = null;
      }
    }

    window.addEventListener("pagehide", resetWorldsTransition);
    window.addEventListener("pageshow", resetWorldsTransition);
    return () => {
      window.removeEventListener("pagehide", resetWorldsTransition);
      window.removeEventListener("pageshow", resetWorldsTransition);
      resetWorldsTransition();
    };
  }, []);

  function enterWorlds(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (enteringWorlds) return;
    setEnteringWorlds(true);
    worldsTimer.current = window.setTimeout(() => window.location.assign(WORLDS_URL), WORLDS_TRANSITION_MS);
  }

  return (
    <>
      <div className={`app-shell flex min-h-screen flex-col bg-bg-primary${enteringWorlds ? " worlds-is-entering" : ""}`}>
        <Navbar onEnterWorlds={enterWorlds} />
        <main className="flex-1">
          <div key={location.pathname} className="route-entry">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
        <Footer />
      </div>

      {enteringWorlds && (
        <div className="worlds-transition" role="status" aria-live="polite" aria-label="Entering Frontend Worlds">
          <div className="worlds-transition__grain" aria-hidden />
          <div className="worlds-transition__stars" aria-hidden />
          <div className="worlds-transition__halo worlds-transition__halo--outer" aria-hidden />
          <div className="worlds-transition__halo worlds-transition__halo--inner" aria-hidden />
          <div className="worlds-transition__orbit worlds-transition__orbit--one" aria-hidden />
          <div className="worlds-transition__orbit worlds-transition__orbit--two" aria-hidden />
          <div className="worlds-transition__portal" aria-hidden>
            <Globe2 size={30} strokeWidth={1.2} />
          </div>
          <div className="worlds-transition__content">
            <div className="worlds-transition__eyebrow"><Sparkles size={13} aria-hidden /> Coordinates shifting</div>
            <p className="worlds-transition__title">Enter another world</p>
            <p className="worlds-transition__subtitle">The familiar fades. Something wider is waiting.</p>
            <div className="worlds-transition__progress" aria-hidden><span /></div>
            <div className="worlds-transition__destination">Frontend Worlds <ArrowUpRight size={13} aria-hidden /></div>
          </div>
        </div>
      )}

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
