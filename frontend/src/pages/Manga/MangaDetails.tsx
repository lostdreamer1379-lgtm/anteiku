import { ArrowLeft, BookOpen, ExternalLink, Play } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useComixChapters, useComixManga } from "@/hooks/useComixManga";

export default function MangaDetails() {
  const { id } = useParams();
  const manga = useComixManga(id);
  const chapters = useComixChapters(id);
  const orderedChapters = [...(chapters.data ?? [])].sort((a, b) => {
    const aNumber = Number(a.number);
    const bNumber = Number(b.number);
    return Number.isNaN(bNumber) || Number.isNaN(aNumber) ? 0 : bNumber - aNumber;
  });

  if (manga.isLoading) return <div className="mx-auto max-w-5xl animate-pulse px-5 py-16 md:px-8"><div className="h-72 rounded-anteiku bg-bg-card" /></div>;
  if (manga.isError || !manga.data) return <div className="mx-auto max-w-xl px-5 py-20 text-center"><p className="text-sm text-muted">This manga could not be loaded.</p><Link to="/manga" className="mt-4 inline-block text-sm text-sage hover:underline">Back to manga</Link></div>;

  const item = manga.data;
  const firstChapter = orderedChapters.at(-1) ?? orderedChapters[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <Link to="/manga" className="flex items-center gap-2 text-sm text-muted hover:text-ivory"><ArrowLeft size={16} /> Back to manga</Link>
      <div className="mt-8 grid gap-8 md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="mx-auto w-48 overflow-hidden rounded-anteiku bg-bg-card shadow-[var(--shadow-soft)] md:mx-0 md:w-full"><div className="aspect-[2/3]">{item.img && <img src={item.img} alt={item.title} className="h-full w-full object-cover" />}</div></div>
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-sage"><BookOpen size={14} /> Manga</p>
          <h1 className="mt-2 font-serif text-3xl text-ivory md:text-5xl">{item.title}</h1>
          <p className="mt-3 text-sm capitalize text-muted">{[item.type, item.status].filter(Boolean).join(" · ")}</p>
          {item.genres?.length ? <div className="mt-5 flex flex-wrap gap-2">{item.genres.map((genre) => <span key={genre} className="rounded-full border border-border-subtle px-3 py-1 text-xs text-muted">{genre}</span>)}</div> : null}
          {item.synopsis && <p className="mt-6 max-w-2xl text-sm leading-7 text-muted">{item.synopsis}</p>}
          {firstChapter && <Link to={`/manga/${id}/read/${firstChapter.id}`} className="mt-7 inline-flex items-center gap-2 rounded-anteiku bg-forest px-5 py-2.5 text-sm font-medium text-ivory hover:bg-sage hover:text-bg-primary"><Play size={15} /> Start reading</Link>}
          <a href={`https://comix.to/title/${encodeURIComponent(item.id)}`} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-2 rounded-anteiku border border-border-subtle px-5 py-2.5 text-sm text-muted hover:border-sage hover:text-ivory"><ExternalLink size={14} /> Open Comix</a>
        </div>
      </div>

      <section className="mt-12" aria-labelledby="chapters-heading">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.3em] text-sage">The archive</p><h2 id="chapters-heading" className="mt-1 font-serif text-2xl text-ivory">Chapters</h2></div><span className="text-xs text-muted">{chapters.isLoading ? "Loading…" : `${orderedChapters.length} chapters`}</span></div>
        {chapters.isError ? <p className="mt-5 text-sm text-muted">Chapter list unavailable right now.</p> : chapters.isLoading ? <div className="mt-5 h-40 animate-pulse rounded-anteiku bg-bg-card" /> : <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{orderedChapters.map((chapter) => <Link key={chapter.id} to={`/manga/${id}/read/${chapter.id}`} className="rounded-anteiku border border-border-subtle bg-bg-card px-3 py-3 text-sm text-muted transition-colors hover:border-sage hover:text-ivory"><span className="block truncate">{chapter.title}</span>{chapter.updatedAt && <span className="mt-1 block text-[0.65rem] text-muted/70">{new Date(chapter.updatedAt).toLocaleDateString()}</span>}</Link>)}</div>}
      </section>
    </div>
  );
}
