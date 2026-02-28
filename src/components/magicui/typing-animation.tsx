"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  duration?: number;
  className?: string;
  as?: React.ElementType;
}

export function TypingAnimation({ text, duration = 50, className, as: Tag = "span" }: Props) {
  const [displayed, setDisplayed] = useState("");
  const i = useRef(0);

  useEffect(() => {
    i.current = 0;
    setDisplayed("");
    const id = setInterval(() => {
      if (i.current < text.length) {
        setDisplayed(text.slice(0, i.current + 1));
        i.current++;
      } else {
        clearInterval(id);
      }
    }, duration);
    return () => clearInterval(id);
  }, [text, duration]);

  return <Tag className={cn("inline-block", className)}>{displayed}<span className="animate-pulse">_</span></Tag>;
}
