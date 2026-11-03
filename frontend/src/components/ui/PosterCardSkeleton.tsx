export default function PosterCardSkeleton({ variant = "carousel" }: { variant?: "carousel" | "grid" | "compact" }) {
  return (
    <div className={`${variant === "grid" ? "min-w-0" : variant === "compact" ? "w-28 shrink-0 snap-start sm:w-32 md:w-36" : "w-40 shrink-0 md:w-48"} animate-pulse`}>
      <div className="aspect-[2/3] rounded-anteiku bg-bg-card" />
      <div className="mt-2 h-3 w-5/6 rounded bg-bg-card" />
      <div className="mt-1.5 h-3 w-2/3 rounded bg-bg-card" />
    </div>
  );
}
