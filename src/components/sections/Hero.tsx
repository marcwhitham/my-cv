"use client";
import Image from "next/image";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { IconArrowRight, IconMessageCircle } from "@/components/icons";

const stats = [
  { value: 27, suffix: "+", label: "Years MoD Service" },
  { value: 15, suffix: "+", label: "Networks Secured" },
  { value: 10, suffix: "+", label: "Certs & Quals" },
];

export function Hero() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-96px)]">

      {/* Left */}
      <div className="flex flex-col gap-6">
        <Image src="/logo.svg" alt="MW" width={56} height={56} className="mb-2" />

        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "#3b82f6" }}>
          // Principal Security Consultant · MoD Specialist
        </p>

        <h1 className="font-mono font-bold leading-none tracking-tight"
          style={{ fontSize: "clamp(3rem,6vw,5.5rem)", color: "#f1f5f9" }}>
          Marc<br />
          <span style={{ color: "#f59e0b" }}>Whitham</span>
        </h1>

        <p className="text-base max-w-md" style={{ color: "#64748b" }}>
          <TypingAnimation
            text="27 years securing UK Defence and critical national infrastructure. I am a Principal Secure by Design Architect, MoD BETA programme lead, and Royal Navy veteran with DV clearance since 2004."
            duration={18}
          />
        </p>

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
      <div className="hidden lg:flex flex-col gap-4">

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

        {/* Credential cards 2×2 */}
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
                <div key={i} className="rounded-xl p-4 border" style={{ background: "#101625", borderColor: "#1a2540" }}>
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
              <div key={i} className="rounded-xl p-4 border flex items-start gap-3"
                style={{ background: "#101625", borderColor: "#1a2540" }}>
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
  );
}
