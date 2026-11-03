import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useComixChapterImages, useComixChapters, useComixManga } from "@/hooks/useComixManga";

export default function MangaReader() {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const manga = useComixManga(id);
  const chapters = useComixChapters(id);
  const images = useComixChapterImages(chapterId);
  const ordered = [...(chapters.data ?? [])].sort((a, b) => {
    const aNumber = Number(a.number);
    const bNumber = Number(b.number);
    return Number.isNaN(bNumber) || Number.isNaN(aNumber) ? 0 : bNumber - aNumber;
  });
  const currentIndex = ordered.findIndex((chapter) => chapter.id === chapterId);
  const newerChapter = currentIndex > 0 ? ordered[currentIndex - 1] : undefined;
  const olderChapter = currentIndex >= 0 ? ordered[currentIndex + 1] : undefined;
  const title = manga.data?.title ?? "Manga";
  const currentChapter = ordered[currentIndex];

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-16 z-20 border-b border-border-subtle/70 bg-bg-primary/90 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link to={`/manga/${id}`} className="flex min-w-0 items-center gap-2 text-sm text-muted hover:text-ivory"><ArrowLeft size={16} /><span className="truncate">{title}</span></Link>
          <span className="shrink-0 text-xs text-sage">{currentChapter?.title ?? "Reading"}</span>
        </div>
      </header>

      {images.isLoading && <div className="mx-auto max-w-3xl space-y-3 px-3 py-8">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[55vh] animate-pulse rounded bg-bg-card" />)}</div>}
      {images.isError && <div className="mx-auto max-w-xl px-5 py-20 text-center"><BookOpen className="mx-auto text-sage" size={28} /><p className="mt-4 text-sm text-muted">This chapter could not be loaded. Try again later.</p></div>}
      {images.data && <main className="mx-auto max-w-3xl bg-black/20 px-1 py-4 sm:px-3 sm:py-8">{images.data.map((image, index) => <img key={`${image.url}-${index}`} src={image.url} alt={`${title}, ${currentChapter?.title ?? "chapter"}, page ${index + 1}`} className="mx-auto block h-auto w-full" loading={index < 2 ? "eager" : "lazy"} />)}</main>}

      <nav className="sticky bottom-0 z-20 border-t border-border-subtle/70 bg-bg-primary/95 px-4 py-3 backdrop-blur" aria-label="Chapter navigation">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {olderChapter ? <button type="button" onClick={() => navigate(`/manga/${id}/read/${olderChapter.id}`)} className="flex items-center gap-2 rounded-anteiku border border-border-subtle px-3 py-2 text-xs text-muted hover:border-sage hover:text-ivory"><ChevronLeft size={15} /> Previous</button> : <span />}
          <Link to={`/manga/${id}`} className="rounded-anteiku border border-border-subtle p-2 text-muted hover:border-sage hover:text-ivory" aria-label="Back to manga"><BookOpen size={16} /></Link>
          {newerChapter ? <button type="button" onClick={() => navigate(`/manga/${id}/read/${newerChapter.id}`)} className="flex items-center gap-2 rounded-anteiku bg-forest px-3 py-2 text-xs text-ivory hover:bg-sage hover:text-bg-primary">Next <ChevronRight size={15} /></button> : <span />}
        </div>
      </nav>
    </div>
  );
}
