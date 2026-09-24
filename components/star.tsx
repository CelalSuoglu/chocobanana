import type { CSSProperties } from "react";

export function Star({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`star animate-twinkle ${className}`}
      style={style}
    >
      ✦
    </span>
  );
}
