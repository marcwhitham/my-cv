"use client";
import Image from "next/image";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { NumberTicker } from "@/components/magicui/number-ticker";

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
        <div>
          <Image src="/logo.svg" alt="MW" width={80} height={36} className="mb-6" />
        </div>

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
            text="27 years securing UK Defence and critical national infrastructure. Principal Secure by Design Architect, MoD BETA programme lead, and Royal Navy veteran with DV clearance since 2004."
            duration={18}
          />
        </p>

        <div className="flex gap-3 flex-wrap">
          <a href="#experience"
            className="px-6 py-3 rounded-full text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "#3b82f6" }}>
            View Experience
          </a>
          <a href="#contact"
            className="px-6 py-3 rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5"
            style={{ border: "1.5px solid #1a2540", color: "#f1f5f9" }}>
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

        {/* Stats row */}
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

      {/* Right — credential cards */}
      <div className="hidden lg:flex flex-col gap-4">

        <div className="rounded-xl p-5 border flex items-start gap-4"
          style={{ background: "#101625", borderColor: "#1a2540" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.22)" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
            </svg>
          </div>
          <div>
            <p className="font-mono font-semibold text-sm" style={{ color: "#f1f5f9" }}>DV Cleared</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Developed Vetting · Active since 2004</p>
            <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.22)" }}>
              Highest UK clearance
            </span>
          </div>
        </div>

        <div className="rounded-xl p-5 border flex items-start gap-4"
          style={{ background: "#101625", borderColor: "#1a2540" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.22)" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <div>
            <p className="font-mono font-semibold text-sm" style={{ color: "#f1f5f9" }}>Secure by Design Lead</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Principal Architect · RN Training Group</p>
            <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(59,130,246,0.10)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.22)" }}>
              MoD BETA Programme
            </span>
          </div>
        </div>

        <div className="rounded-xl p-5 border flex items-start gap-4"
          style={{ background: "#101625", borderColor: "#1a2540" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.22)" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div>
            <p className="font-mono font-semibold text-sm" style={{ color: "#f1f5f9" }}>Royal Navy Veteran</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Fleet ITSO · Intelligence Officer · EW Instructor</p>
            <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(139,92,246,0.10)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.22)" }}>
              27+ years service
            </span>
          </div>
        </div>

        {/* Orgs strip */}
        <div className="rounded-xl p-4 border" style={{ background: "#101625", borderColor: "#1a2540" }}>
          <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#2d3f5a" }}>Organisations served</p>
          <div className="flex flex-wrap gap-2">
            {["Royal Navy", "Fujitsu Defence & NS", "Ministry of Defence", "Selborne Programme", "HMNB Clyde"].map(o => (
              <span key={o} className="text-xs px-2 py-1 rounded"
                style={{ background: "#162030", color: "#64748b", border: "1px solid #1a2540" }}>
                {o}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
