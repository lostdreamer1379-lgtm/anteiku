export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-serif text-sm uppercase tracking-[0.3em] text-sage">404</p>
      <h1 className="font-serif text-3xl text-ivory">This cup has run empty.</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you're looking for isn't on the menu. Head back and try again.
      </p>
    </div>
  );
}
