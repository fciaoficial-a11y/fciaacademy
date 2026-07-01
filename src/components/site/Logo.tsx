import fciaLogo from "@/assets/fcia-logo-full.png.asset.json";
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
      <img
        src={fciaLogo.url}
        alt="FCIA Academy"
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />

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
