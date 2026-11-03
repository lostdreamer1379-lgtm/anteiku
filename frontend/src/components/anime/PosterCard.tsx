import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { AnimeSummary } from "@/types/anime";

export default function PosterCard({ anime }: { anime: AnimeSummary }) {
  const title = anime.title.english ?? anime.title.romaji;

  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group w-40 shrink-0 md:w-48"
      aria-label={title}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-anteiku bg-bg-card">
        {anime.coverImage ? (
          <img
            src={anime.coverImage}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No cover
          </div>
        )}
        {anime.averageScore !== null && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-bg-primary/80 px-2 py-0.5 text-xs text-ivory backdrop-blur">
            <Star size={12} className="fill-sage text-sage" />
            {(anime.averageScore / 10).toFixed(1)}
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ivory">{title}</p>
      <p className="mt-0.5 text-xs text-muted">
        {[anime.format, anime.year].filter(Boolean).join(" · ")}
      </p>
    </Link>
  );
}
