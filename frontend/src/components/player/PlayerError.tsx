import { AlertCircle } from "lucide-react";

export default function PlayerError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <AlertCircle size={32} className="text-red-400" />
      <p className="max-w-sm text-sm text-white/60">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-anteiku border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-sage hover:text-sage"
        >
          Try again
        </button>
      )}
    </div>
  );
}
