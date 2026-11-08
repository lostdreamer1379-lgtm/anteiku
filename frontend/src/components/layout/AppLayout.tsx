import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function AppLayout() {
  const [isOpening, setIsOpening] = useState(true);

  useEffect(() => {
    const openingTimer = window.setTimeout(() => setIsOpening(false), 1800);
    return () => window.clearTimeout(openingTimer);
  }, []);

  return (
    <div className="app-shell flex min-h-screen flex-col bg-bg-primary">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
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
            <p className="text-[0.58rem] uppercase tracking-[0.38em] text-muted">A quiet place to begin</p>
          </div>
        </div>
      )}
    </div>
  );
}
