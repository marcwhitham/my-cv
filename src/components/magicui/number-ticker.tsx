"use client";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  suffix?: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function NumberTicker({ value, suffix = "", className, delay = 0, duration = 1.2 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      const controls = animate(mv, value, {
        duration,
        ease: "linear",
        onUpdate: (v) => {
          if (ref.current) ref.current.textContent = Math.floor(v) + suffix;
        },
      });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [isInView, value, delay, duration, mv, suffix]);

  return <span ref={ref} className={cn("tabular-nums", className)}>0{suffix}</span>;
}
