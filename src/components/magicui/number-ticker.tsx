"use client";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  suffix?: string;
  className?: string;
  delay?: number;
}

export function NumberTicker({ value, suffix = "", className, delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => mv.set(value), delay * 1000);
    }
  }, [isInView, value, delay, mv]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.floor(v) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref} className={cn("tabular-nums", className)}>0{suffix}</span>;
}
