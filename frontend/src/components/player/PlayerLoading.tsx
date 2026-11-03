export default function PlayerLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-3">
        <div className="h-1.5 w-1.5 animate-ping rounded-full bg-sage" />
        <p className="text-xs text-white/40">Loading episode…</p>
      </div>
    </div>
  );
}
