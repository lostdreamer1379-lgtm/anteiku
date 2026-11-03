import type { AnimeSummary } from "@/types/anime";
import PosterCard from "./PosterCard";
import PosterCardSkeleton from "@/components/ui/PosterCardSkeleton";

export default function PosterCarousel({
  title,
  items,
  isLoading,
}: {
  title: string;
  items: AnimeSummary[];
  isLoading?: boolean;
}) {
  return (
    <section className="px-5 py-8 md:px-8">
      <h2 className="mb-4 font-serif text-xl text-ivory">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <PosterCardSkeleton key={i} />)
          : items.length === 0
          ? <p className="text-sm text-muted">Nothing here yet.</p>
          : items.map((anime) => <PosterCard key={anime.id} anime={anime} />)}
      </div>
    </section>
  );
}
