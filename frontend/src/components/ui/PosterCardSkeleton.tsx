export default function PosterCardSkeleton() {
  return (
    <div className="w-40 shrink-0 animate-pulse md:w-48">
      <div className="aspect-[2/3] rounded-anteiku bg-bg-card" />
      <div className="mt-2 h-3 w-5/6 rounded bg-bg-card" />
      <div className="mt-1.5 h-3 w-2/3 rounded bg-bg-card" />
    </div>
  );
}
