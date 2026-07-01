import fciaLogo from "@/assets/fcia-logo.png.asset.json";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function Logo({ className, size = 36, showWordmark = true, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white to-white/85 p-1.5 ring-1 ring-white/50 shadow-[0_0_20px_-4px_rgba(139,92,246,0.55)]"
        style={{ width: size, height: size }}
      >
        <img
          src={fciaLogo.url}
          alt="FCIA Academy"
          className="h-full w-full object-contain"
        />
      </span>

      {showWordmark ? (
        <span
          className={cn(
            "font-display text-[15px] font-semibold tracking-tight text-foreground",
            wordmarkClassName,
          )}
        >
          FCIA<span className="text-muted-foreground/50">/</span>
          <span className="font-medium text-muted-foreground">Academy</span>
        </span>
      ) : null}
    </span>
  );
}
