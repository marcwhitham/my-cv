"use client";
import { motion } from "framer-motion";

const certs = [
  { abbr: "CISM",  label: "Certified Information Security Manager",                  issuer: "ISACA",                                   color: "var(--gold)",   bg: "var(--gold-dim)",   border: "var(--gold-border)"   },
  { abbr: "ISO",   label: "ISO 27001 Lead Auditor",                                  issuer: "Certification Body Accredited",            color: "var(--green)",  bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.22)"  },
  { abbr: "SANS",  label: "SANS SEC566 — Implementing & Auditing Critical Controls",  issuer: "SANS Institute",                          color: "var(--blue)",   bg: "var(--blue-dim)",   border: "var(--blue-border)"   },
  { abbr: "CISMP", label: "Certificate in Information Security Management Principles", issuer: "BCS",                                    color: "var(--purple)", bg: "rgba(139,92,246,0.10)",  border: "rgba(139,92,246,0.22)"  },
  { abbr: "CISCO", label: "CYBER Defence Pathway",                                    issuer: "Cisco / MoD Sponsored",                  color: "var(--blue)",   bg: "var(--blue-dim)",   border: "var(--blue-border)"   },
  { abbr: "ICSI",  label: "Cyber Security Controls",                                  issuer: "International CyberSecurity Institute",   color: "var(--gold)",   bg: "var(--gold-dim)",   border: "var(--gold-border)"   },
  { abbr: "ITSO",  label: "ITSO / DITSO",                                             issuer: "IT Security Officer — MoD Certified",    color: "var(--red)",    bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.20)"   },
  { abbr: "JMIA",  label: "Joint Maritime Intelligence Analysis Course",               issuer: "Royal Navy / Joint Intelligence",        color: "#93c5fd",       bg: "rgba(30,58,138,0.20)",   border: "rgba(30,58,138,0.50)"   },
];

export function Qualifications() {
  return (
    <section id="qualifications" className="py-24" style={{ background: "var(--surface)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "var(--blue)" }}>04 / Qualifications</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--foreground)" }}>
          Certifications &amp; Education
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {certs.map((c, index) => (
            <motion.div
              key={c.abbr}
              className="border p-4 flex items-start gap-3 transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
            >
              <div className="w-12 h-12 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 text-center leading-tight"
                style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                {c.abbr}
              </div>
              <div>
                <h3 className="font-mono font-semibold text-xs leading-snug mb-1" style={{ color: "var(--foreground)" }}>{c.label}</h3>
                <p className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{c.issuer}</p>
                <span className="font-mono text-xs" style={{ color: "var(--green)" }}>Active</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Education */}
          <motion.div
            className="border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>Education</h3>
            <h4 className="font-mono font-semibold text-base mb-1" style={{ color: "var(--foreground)" }}>BSc (Hons) Security &amp; Intelligence</h4>
            <span className="font-mono text-xs px-2 py-1"
              style={{ background: "rgba(139,92,246,0.08)", color: "var(--purple)", border: "1px solid rgba(139,92,246,0.18)" }}>
              Defence CMI Leadership &amp; Management
            </span>
          </motion.div>

          {/* Clearance */}
          <motion.div
            className="border p-6"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>Security Clearances</h3>
            <div className="p-4 flex items-center gap-4 mb-3"
              style={{ background: "var(--gold-dim)", border: "1px solid var(--gold-border)" }}>
              <svg className="w-9 h-9 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--gold)" }}>
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
              </svg>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "var(--gold)" }}>Developed Vetting (DV)</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Held continuously since 2004 · Active · Defence Vetted</p>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 shrink-0"
                style={{ background: "rgba(16,185,129,0.10)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.22)" }}>
                Active
              </span>
            </div>
            <p className="text-xs italic" style={{ color: "var(--muted)" }}>
              Available for SC, DV and above environments. References available upon request.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
