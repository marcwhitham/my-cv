import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  angle?: number;
}

export function RetroGrid({ className, angle = 65 }: Props) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden opacity-30", className)}
      style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
    >
      <div className="absolute inset-[-100%]" style={{ transform: "translateZ(0)" }}>
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59,130,246,0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59,130,246,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            transform: `skewY(calc(-1 * var(--grid-angle, 65deg)))`,
            transformOrigin: "0 0",
          }}
        />
      </div>
    </div>
  );
}
