const certs = [
  { abbr: "CISM",  label: "Certified Information Security Manager",                  issuer: "ISACA",                                   color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)" },
  { abbr: "ISO",   label: "ISO 27001 Lead Auditor",                                  issuer: "Certification Body Accredited",            color: "#10b981", bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.22)"  },
  { abbr: "SANS",  label: "SANS SEC566 — Implementing & Auditing Critical Controls",  issuer: "SANS Institute",                          color: "#3b82f6", bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.22)"  },
  { abbr: "CISMP", label: "Certificate in Information Security Management Principles", issuer: "BCS",                                    color: "#8b5cf6", bg: "rgba(139,92,246,0.10)",  border: "rgba(139,92,246,0.22)"  },
  { abbr: "CISCO", label: "CYBER Defence Pathway",                                    issuer: "Cisco / MoD Sponsored",                  color: "#60a5fa", bg: "rgba(59,130,246,0.10)",  border: "rgba(59,130,246,0.22)"  },
  { abbr: "ICSI",  label: "Cyber Security Controls",                                  issuer: "International CyberSecurity Institute",   color: "#fbbf24", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.20)"  },
  { abbr: "ITSO",  label: "ITSO / DITSO",                                             issuer: "IT Security Officer — MoD Certified",    color: "#f87171", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.20)"   },
  { abbr: "JMIA",  label: "Joint Maritime Intelligence Analysis Course",               issuer: "Royal Navy / Joint Intelligence",        color: "#93c5fd", bg: "rgba(30,58,138,0.20)",   border: "rgba(30,58,138,0.50)"   },
];

export function Qualifications() {
  return (
    <section id="qualifications" className="py-24" style={{ background: "#0b0f1a" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#3b82f6" }}>04 / Qualifications</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#f1f5f9" }}>
          Certifications &amp; Education
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {certs.map((c) => (
            <div key={c.abbr}
              className="rounded-xl border p-4 flex items-start gap-3 transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: "#101625", borderColor: "#1a2540" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 text-center leading-tight"
                style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {c.abbr}
              </div>
              <div>
                <h3 className="font-mono font-semibold text-xs leading-snug mb-1" style={{ color: "#f1f5f9" }}>{c.label}</h3>
                <p className="text-xs mb-1.5" style={{ color: "#64748b" }}>{c.issuer}</p>
                <span className="font-mono text-xs" style={{ color: "#10b981" }}>Active</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Education */}
          <div className="rounded-xl border p-6" style={{ background: "#101625", borderColor: "#1a2540" }}>
            <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Education</h3>
            <h4 className="font-mono font-semibold text-base mb-1" style={{ color: "#f1f5f9" }}>BSc (Hons) Security &amp; Intelligence</h4>
            <p className="text-sm mb-3" style={{ color: "#64748b" }}>University — First / Upper Second Class</p>
            <span className="font-mono text-xs px-2 py-1 rounded"
              style={{ background: "rgba(139,92,246,0.08)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.18)" }}>
              Defence CMI Leadership &amp; Management
            </span>
          </div>

          {/* Clearance */}
          <div className="rounded-xl border p-6" style={{ background: "#101625", borderColor: "#1a2540" }}>
            <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Security Clearances</h3>
            <div className="rounded-lg p-4 flex items-center gap-4 mb-3"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}>
              <svg className="w-9 h-9 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
              </svg>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "#f59e0b" }}>Developed Vetting (DV)</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Held continuously since 2004 · Highest UK level · Defence Vetted</p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded shrink-0"
                style={{ background: "rgba(16,185,129,0.10)", color: "#10b981", border: "1px solid rgba(16,185,129,0.22)" }}>
                Active
              </span>
            </div>
            <p className="text-xs italic" style={{ color: "#64748b" }}>
              Available for SC, DV and above environments. References available upon request.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
