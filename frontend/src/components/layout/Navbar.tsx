import { NavLink, Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState, useRef, type FormEvent } from "react";
import clsx from "clsx";
import { LayoutGroup, motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchAnime } from "@/hooks/useSearchAnime";

const links = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/seasonal", label: "Seasonal" },
  { to: "/watchlist", label: "Watchlist" },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 250);
  const suggestions = useSearchAnime(
    { search: debouncedSearch || undefined, sort: ["SEARCH_MATCH"], perPage: 6 },
    Boolean(debouncedSearch),
  );

  useEffect(() => {
    if (!searchOpen) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [searchOpen]);

  async function handleSignOut() {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
    setSearchOpen(false);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle/60 bg-bg-primary/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2 font-serif text-lg tracking-wide text-ivory">
          <span className="h-2 w-2 rounded-full bg-sage" aria-hidden />
          ANTEIKU
        </Link>

        <LayoutGroup id="main-navigation">
          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "relative py-5 text-sm tracking-wide text-muted transition-colors hover:text-ivory",
                  isActive && "text-ivory",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="active-navigation-slider"
                      transition={{ type: "spring", stiffness: 460, damping: 34, mass: 0.7 }}
                      className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-sage shadow-[0_0_12px_rgb(var(--color-sage)/0.7)]"
                    />
                  )}
                </>
              )}
            </NavLink>
            ))}
          </div>
        </LayoutGroup>

        <div className="flex items-center gap-3">
          <form ref={searchRef} onSubmit={handleSearch} className="relative w-32 sm:w-44 lg:w-56">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search anime…"
              aria-label="Search anime"
              aria-expanded={searchOpen && Boolean(searchQuery.trim())}
              aria-controls="navbar-search-results"
              className="h-9 w-full rounded-anteiku border border-border-subtle bg-bg-card/80 py-2 pl-9 pr-3 text-xs text-ivory placeholder:text-muted focus:border-sage focus:outline-none"
            />

            {searchOpen && searchQuery.trim() && (
              <div
                id="navbar-search-results"
                role="listbox"
                className="absolute right-0 top-[calc(100%+0.55rem)] z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-anteiku border border-border-subtle bg-bg-card shadow-[var(--shadow-soft)]"
              >
                {suggestions.isLoading ? (
                  <div className="space-y-2 p-3" aria-live="polite">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-12 animate-pulse rounded-md bg-bg-secondary" />
                    ))}
                  </div>
                ) : suggestions.data?.results.length ? (
                  <>
                    <div className="border-b border-border-subtle/70 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-sage">
                      Top matches
                    </div>
                    <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-1.5">
                      {suggestions.data.results.slice(0, 6).map((anime) => {
                        const title = anime.title.english ?? anime.title.romaji;
                        return (
                          <Link
                            key={anime.id}
                            to={`/anime/${anime.id}`}
                            role="option"
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-bg-secondary"
                          >
                            <img src={anime.coverImage} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />
                            <span className="min-w-0">
                              <span className="block truncate text-sm text-ivory">{title}</span>
                              <span className="mt-1 block truncate text-xs text-muted">
                                {[anime.format, anime.year, anime.genres[0]].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <button
                      type="submit"
                      className="w-full border-t border-border-subtle/70 px-3 py-2.5 text-left text-xs text-sage transition-colors hover:bg-bg-secondary hover:text-ivory"
                    >
                      View all results for “{searchQuery.trim()}”
                    </button>
                  </>
                ) : (
                  <p className="p-4 text-sm text-muted" role="status">No anime found yet.</p>
                )}
              </div>
            )}
          </form>

          {user ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                type="button"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-ivory text-xs font-medium hover:bg-sage hover:text-bg-primary transition-colors"
              >
                {user.email?.[0]?.toUpperCase() ?? <User size={14} />}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-anteiku border border-border-subtle bg-bg-card py-1 shadow-soft">
                  <p className="px-4 py-2 text-xs text-muted truncate">{user.email}</p>
                  <div className="my-1 h-px bg-border-subtle/60" />
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ivory hover:bg-forest/50"
                  >
                    <User size={14} /> Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-forest/50 hover:text-ivory"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="hidden rounded-anteiku border border-border-subtle px-4 py-1.5 text-sm text-muted transition-colors hover:border-sage hover:text-ivory md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-anteiku p-2 text-muted hover:bg-bg-card hover:text-ivory md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border-subtle/60 px-5 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    "rounded-anteiku px-3 py-2.5 text-sm text-muted hover:bg-bg-card hover:text-ivory",
                    isActive && "bg-bg-card text-ivory"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-anteiku px-3 py-2.5 text-sm text-muted hover:bg-bg-card hover:text-ivory"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={async () => { await handleSignOut(); setOpen(false); }}
                  className="rounded-anteiku px-3 py-2.5 text-left text-sm text-muted hover:bg-bg-card hover:text-ivory"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                onClick={() => setOpen(false)}
                className="rounded-anteiku px-3 py-2.5 text-sm text-muted hover:bg-bg-card hover:text-ivory"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
