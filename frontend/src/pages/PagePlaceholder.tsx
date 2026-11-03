// Shared shell for pages not yet built out past Phase 1.
// Each real page replaces this with its Phase 3/4/5 implementation.
export default function PagePlaceholder({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 md:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-sage">{phase}</p>
      <h1 className="mt-2 font-serif text-3xl text-ivory">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
