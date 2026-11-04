interface UserAvatarProps {
  src?: string | null;
  label: string;
  className?: string;
}

export default function UserAvatar({ src, label, className = "h-12 w-12" }: UserAvatarProps) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black ${className}`} aria-label={label}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : (
        <>
          <span className="absolute inset-[18%] rounded-full border border-white/90" />
          <span className="absolute inset-[35%] rounded-full border border-white/75" />
          <span className="absolute inset-[47%] rounded-full border border-white/60" />
        </>
      )}
    </span>
  );
}
