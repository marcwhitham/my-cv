"use client";

import { motion } from "framer-motion";

const groups = [
  {
    category: "MoD Policy & Doctrine",
    accent: "var(--gold)",
    items: ["JSP 440 / 453 / 604", "STRAP", "Defence CMI", "ITSO / DITSO (MoD)"],
  },
  {
    category: "International Standards",
    accent: "var(--blue)",
    items: ["ISO 27001", "NIST 800 Series", "NIST CMF & RMF", "Cyber Essentials Plus"],
  },
  {
    category: "Government Guidance",
    accent: "var(--green)",
    items: ["NCSC Guidance", "Secure by Design", "SQEP Workforce Mgmt", "NCSC CAF"],
  },
  {
    category: "Operations & Governance",
    accent: "var(--purple)",
    items: ["SOC Operations", "Cyber Assurance Review Board", "Info Asset Assurance", "Risk Management"],
  },
];

export function FrameworksBand() {
  return (
    <section
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "4rem 0",
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "var(--blue)" }}>
          // Operational Standards Applied
        </p>
        <h2
          className="font-mono font-bold tracking-tight mb-10"
          style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--foreground)" }}
        >
          Standards &amp; Frameworks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((group, i) => (
            <motion.div
              key={group.category}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderTop: `3px solid ${group.accent}`,
                padding: "1.25rem 1.25rem 1.5rem",
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <p
                className="font-mono text-xs uppercase tracking-widest mb-4"
                style={{ color: group.accent }}
              >
                {group.category}
              </p>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="font-mono font-bold flex-shrink-0"
                      style={{ color: group.accent, fontSize: "0.7rem", lineHeight: "1.5" }}
                    >
                      ›
                    </span>
                    <span className="font-mono text-xs leading-snug" style={{ color: "var(--muted)" }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
