import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "nav" | "hero" | "card";
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
};

const sizeStyles = {
  nav: {
    image: "h-11 w-auto sm:h-12",
    imageWidth: 48,
    imageHeight: 48,
    wordmark: "text-xl sm:text-2xl",
  },
  hero: {
    image: "h-32 w-auto sm:h-40",
    imageWidth: 160,
    imageHeight: 160,
    wordmark: "text-3xl sm:text-4xl",
  },
  card: {
    image: "h-32 w-auto sm:h-44",
    imageWidth: 176,
    imageHeight: 176,
    wordmark: "text-2xl sm:text-3xl",
  },
} as const;

export function BrandLogo({
  size = "nav",
  showWordmark = true,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <Image
        src="/logo.png"
        alt="LivePoll"
        width={styles.imageWidth}
        height={styles.imageHeight}
        className={cn(styles.image, "shrink-0 dark:hidden")}
        priority
      />
      <Image
        src="/logo-dark.png"
        alt="LivePoll"
        width={styles.imageWidth}
        height={styles.imageHeight}
        className={cn(styles.image, "hidden shrink-0 dark:block")}
        priority
      />

      {showWordmark ? (
        <div className="flex flex-col gap-0.5">
          <span
            className={cn(
              "font-heading font-semibold leading-none tracking-tight",
              styles.wordmark,
              wordmarkClassName,
            )}
          >
            LivePoll
          </span>
          {size !== "nav" ? (
            <span className="text-sm text-muted-foreground sm:text-base">
              Your vote. Live.
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
