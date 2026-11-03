import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle/60 bg-bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-serif text-lg text-ivory">ANTEIKU</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            A quiet corner for anime discovery, tracking and viewing — built for
            people who like to take their shows slowly, like a good cup of coffee.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sage">Anteiku</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link to="/about" className="hover:text-ivory">About</Link></li>
            <li><Link to="/credits" className="hover:text-ivory">Credits</Link></li>
            <li><Link to="/contact" className="hover:text-ivory">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sage">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link to="/privacy" className="hover:text-ivory">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-ivory">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border-subtle/60 px-5 py-5 text-center text-xs text-muted md:px-8">
        Anime metadata provided by the AniList API. Anteiku is an independent
        project and is not affiliated with AniList or any studio.
      </div>
    </footer>
  );
}
