"use client";
import Image from "next/image";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ParticleCanvas } from "@/components/magicui/particle-canvas";
import { IconArrowRight, IconMessageCircle } from "@/components/icons";
import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 27, suffix: "+", label: "Years MoD Service" },
  { value: 15, suffix: "+", label: "Networks Secured" },
  { value: 10, suffix: "+", label: "Certs & Quals" },
];

const TERMINAL_LINES = [
  { prompt: "$ whoami", output: "> Marc Whitham — Principal Security Consultant" },
  { prompt: "$ clearance --status", output: "> DV Active · Held since 2004 · Highest UK level" },
  { prompt: "$ specialisms --list", output: "> Secure by Design · NIST RMF · ISO 27001 · SOC Lead" },
  { prompt: "$ availability --check", output: "> Available Q2 2026 · SC/DV environments ✓" },
];

const LINE_GAP = 400;
const wordDelay  = () => 35 + Math.random() * 30;   // 35–65 ms per char (blue)
const wordPause  = () => 160 + Math.random() * 190; // 160–350 ms between words (blue)
const OUTPUT_MS  = 18;                               // ms per char (green, fast)

interface TerminalLine {
  text: string;
  isPrompt: boolean;
  complete: boolean;
}

function TerminalBlock() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const done = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function pushOrUpdate(prev: TerminalLine[], text: string, isPrompt: boolean): TerminalLine[] {
      const next = [...prev];
      const last = next.length - 1;
      if (last >= 0 && !next[last].complete && next[last].isPrompt === isPrompt) {
        next[last] = { ...next[last], text };
      } else {
        next.push({ text, isPrompt, complete: false });
      }
      return next;
    }

    function markComplete(prev: TerminalLine[]): TerminalLine[] {
      const next = [...prev];
      next[next.length - 1] = { ...next[next.length - 1], complete: true };
      return next;
    }

    async function typeAll() {
      for (const entry of TERMINAL_LINES) {
        if (cancelled) return;

        // Blue prompt — word by word: type chars fast, pause between words
        const words = entry.prompt.split(" ");
        let built = "";
        for (let w = 0; w < words.length; w++) {
          for (const ch of words[w]) {
            if (cancelled) return;
            await delay(wordDelay());
            built += ch;
            setLines(prev => pushOrUpdate(prev, built, true));
          }
          if (w < words.length - 1) {
            if (cancelled) return;
            await delay(wordPause());
            built += " ";
            setLines(prev => pushOrUpdate(prev, built, true));
          }
        }
        setLines(markComplete);

        await delay(LINE_GAP);
        if (cancelled) return;

        // Green output — fast, consistent
        for (let i = 1; i <= entry.output.length; i++) {
          if (cancelled) return;
          await delay(OUTPUT_MS);
          setLines(prev => pushOrUpdate(prev, entry.output.slice(0, i), false));
        }
        setLines(markComplete);

        await delay(LINE_GAP);
      }
      done.current = true;
    }

    typeAll();

    // Blinking cursor interval
    const cursorInterval = setInterval(() => {
      setShowCursor((v) => !v);
    }, 530);

    return () => {
      cancelled = true;
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden font-mono text-xs"
      style={{ background: "#0b1120", border: "1px solid #1a2540" }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "#1a2540", background: "#0d1526" }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
        <span className="ml-2" style={{ color: "#2d3f5a" }}>// terminal</span>
      </div>

      {/* Terminal body */}
      <div className="p-4 h-[12rem] overflow-hidden flex flex-col gap-1">
        {lines.map((line, i) => (
          <div
            key={i}
            style={{ color: line.isPrompt ? "#3b82f6" : "#10b981" }}
          >
            {line.text}
            {i === lines.length - 1 && done.current && showCursor && (
              <span
                className="inline-block w-1.5 h-3.5 ml-0.5 align-middle"
                style={{ background: "#f1f5f9", opacity: 0.8 }}
              />
            )}
          </div>
        ))}
        {lines.length === 0 && (
          <span style={{ color: "#3b82f6" }}>
            {showCursor && (
              <span
                className="inline-block w-1.5 h-3.5 align-middle"
                style={{ background: "#f1f5f9", opacity: 0.8 }}
              />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function Hero() {
  const leftColRef   = useRef<HTMLDivElement>(null);
  const rightColRef  = useRef<HTMLDivElement>(null);
  const terminalRef  = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full overflow-hidden min-h-[calc(100vh-96px)]">
      {/* Full-width canvas */}
      <ParticleCanvas obstacles={[leftColRef, rightColRef, terminalRef]} />

      <section className="relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-96px)]">
      {/* Left */}
      <div ref={leftColRef} className="relative z-10 flex flex-col gap-6">
        <Image src="/logo.svg" alt="MW" width={56} height={56} className="mb-2" />

        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "#3b82f6" }}>
          // Principal Security Consultant · MoD Specialist
        </p>

        <h1 className="font-mono font-bold leading-none tracking-tight"
          style={{ fontSize: "clamp(3rem,6vw,5.5rem)", color: "#f1f5f9" }}>
          Marc<br />
          <span style={{ color: "#f59e0b" }}>Whitham</span>
        </h1>

        {/* Terminal block replacing TypingAnimation */}
        <div ref={terminalRef} className="max-w-md">
          <TerminalBlock />
        </div>

        <div className="flex gap-3 flex-wrap">
          <a href="#experience"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "#3b82f6" }}>
            View Experience
            <IconArrowRight size={15} />
          </a>
          <a href="#contact"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5"
            style={{ border: "1.5px solid #1a2540", color: "#f1f5f9" }}>
            <IconMessageCircle size={15} />
            Discuss a Project
          </a>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-sm" style={{ color: "#64748b" }}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
            DV Cleared (Active)
          </span>
          <span style={{ color: "#2d3f5a" }}>·</span>
          <span>Hampshire, UK</span>
          <span style={{ color: "#2d3f5a" }}>·</span>
          <span>SC &amp; Above Environments</span>
        </div>

        <div className="flex gap-8 pt-4 border-t" style={{ borderColor: "#1a2540" }}>
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="font-mono font-bold text-2xl" style={{ color: "#f59e0b" }}>
                <NumberTicker value={s.value} suffix={s.suffix} />
              </span>
              <span className="text-xs" style={{ color: "#64748b" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div ref={rightColRef} className="relative z-10 hidden lg:flex flex-col gap-4">

        {/* Photo */}
        <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "#1a2540" }}>
          <Image
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=780&q=80"
            alt="Secure server infrastructure"
            width={780}
            height={440}
            className="w-full object-cover"
            style={{ aspectRatio: "16/9", filter: "brightness(0.55) saturate(0.7)" }}
            priority
          />
          <div className="absolute inset-0 flex items-end p-4">
            <span className="font-mono text-xs px-2 py-1 rounded"
              style={{ background: "rgba(6,8,16,0.75)", color: "#64748b", border: "1px solid #1a2540" }}>
              // Defence-grade network infrastructure
            </span>
          </div>
        </div>

        {/* Credential cards 2x2 — glassmorphism */}
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              icon: <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />,
              color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)",
              title: "DV Cleared", sub: "Active since 2004", badge: "Highest UK clearance",
            },
            {
              icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
              color: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.22)",
              title: "SbD Lead", sub: "MoD BETA Programme", badge: "Principal Architect",
            },
            {
              icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
              color: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.22)",
              title: "RN Veteran", sub: "27+ years service", badge: "Intelligence · EW · ITSO",
            },
            {
              isOrgs: true,
            },
          ].map((card, i) => {
            if ("isOrgs" in card && card.isOrgs) {
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 border"
                  style={{
                    background: "rgba(16,22,37,0.55)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderColor: "rgba(59,130,246,0.15)",
                  }}
                >
                  <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#2d3f5a" }}>Orgs served</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Royal Navy", "Fujitsu", "MoD", "Selborne", "HMNB Clyde"].map(o => (
                      <span key={o} className="text-xs px-2 py-0.5 rounded"
                        style={{ background: "#162030", color: "#64748b", border: "1px solid #1a2540" }}>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            const c = card as { icon: React.ReactNode; color: string; bg: string; border: string; title: string; sub: string; badge: string };
            return (
              <div
                key={i}
                className="rounded-xl p-4 border flex items-start gap-3"
                style={{
                  background: "rgba(16,22,37,0.55)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderColor: "rgba(59,130,246,0.15)",
                }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{c.icon}</svg>
                </div>
                <div>
                  <p className="font-mono font-semibold text-sm" style={{ color: "#f1f5f9" }}>{c.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{c.sub}</p>
                  <span className="inline-block mt-1.5 text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                    {c.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </section>
    </div>
  );
}
