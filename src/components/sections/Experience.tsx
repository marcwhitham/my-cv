"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const roles = [
  {
    title: "Principal Security Lead",
    org: "Fujitsu Defence & National Security",
    sub: "Selborne Programme",
    date: "Jan 2023 — Present",
    accent: "#f59e0b",
    accentDim: "rgba(245,158,11,0.10)",
    accentBorder: "rgba(245,158,11,0.22)",
    bullets: [
      "End-to-end cybersecurity ownership across <strong>15 Royal Navy physical and cloud-based IT networks</strong> at both Official and Secret classification.",
      "Principal Secure by Design Architect for the Royal Navy Submarine Training Centre at <strong>HMNB Clyde</strong>.",
      "Delivered Full Secure by Design Assurance Architecture in accordance with <strong>JSP 440 Part 2 Leaflet 5C</strong>.",
      "Designed secure architecture across on-premise and cloud environments, aligning with <strong>ISO 27001 and NIST 800 series</strong>.",
      "Tier 1–3 Strategic Risk Assessments for the Royal Navy using NIST-based methodologies.",
      "Responsible for the Selborne Security Operations Centre — vulnerability assessments and risk analyses.",
      "Implemented a <strong>Security RACI Matrix and Cyber Assurance Review Board</strong>.",
      "Developed Assurance Artifacts using <strong>JSP 440 5C, JSP 453, NIST CMF and RMF</strong>.",
    ],
    tags: ["Secure by Design", "Cloud Security", "SOC Leadership", "JSP 440/453", "NIST RMF", "ISO 27001"],
  },
  {
    title: "Security Consultant",
    org: "Fujitsu Defence & National Security",
    sub: "",
    date: "Nov 2021 — Jan 2023",
    accent: "#3b82f6",
    accentDim: "rgba(59,130,246,0.10)",
    accentBorder: "rgba(59,130,246,0.22)",
    bullets: [
      "Delivered comprehensive cybersecurity solutions across projects and multiple operational networks.",
      "Spearheaded development of <strong>Secure by Design Principles</strong> as part of the MoD BETA programme.",
      "Conducted regular risk assessments, vulnerability scans and physical security reviews.",
      "Produced Information Asset Assurance documentation in line with <strong>ISO 27001, NIST, JSP440/604</strong>.",
      "Managed and secured physical, virtual and cloud infrastructure across multiple operational sites.",
    ],
    tags: ["Info Asset Assurance", "Vulnerability Assessment", "ISO 27001", "Cloud Security"],
  },
  {
    title: "Fleet Information Technology Security Officer",
    org: "Royal Navy",
    sub: "Cyber Assurance Team",
    date: "Jan 2016 — Jan 2022",
    accent: "#3b5998",
    accentDim: "rgba(59,89,152,0.12)",
    accentBorder: "rgba(59,89,152,0.3)",
    bullets: [
      "Senior member of the Cyber Assurance Team responsible for cyber security practices, auditing and training.",
      "Introduced numerous best practices to the fleet and delivered training to Royal Navy ITSOs.",
      "Built relationships with stakeholders and senior leadership driving compliance improvements.",
      "Ensured alignment with <strong>ISO 27001 Framework and JSP440/604</strong> for MoD accreditation.",
      "Conducted training and auditing of <strong>RN STRAP security</strong>.",
      "Implemented continuous improvement initiatives achieving successful audits on <strong>sea-going platforms and shoreside establishments</strong>.",
    ],
    tags: ["Fleet Security", "STRAP", "Team Management", "Auditing", "MoD Accreditation"],
  },
  {
    title: "Senior Instructor — Electronic Warfare School",
    org: "Royal Navy",
    sub: "",
    date: "Sep 2013 — Jan 2016",
    accent: "#3b5998",
    accentDim: "rgba(59,89,152,0.12)",
    accentBorder: "rgba(59,89,152,0.3)",
    bullets: [
      "Planned and coordinated courses in Electronic Warfare, leadership and management training.",
      "Line managed a team of <strong>10 Instructors</strong> delivering specialist EW training.",
    ],
    tags: ["Electronic Warfare", "Leadership & Management", "Instructor"],
  },
  {
    title: "Intelligence Officer",
    org: "Royal Navy",
    sub: "Bahrain & Afghanistan",
    date: "Mar 2008 — Nov 2013",
    accent: "#3b5998",
    accentDim: "rgba(59,89,152,0.12)",
    accentBorder: "rgba(59,89,152,0.3)",
    bullets: [
      "Completed consecutive <strong>combat deployments to Afghanistan</strong> as an intelligence specialist.",
      "Concurrently managed the <strong>Iran Intelligence Desk in Bahrain</strong>.",
    ],
    tags: ["Intelligence Analysis", "Combat Operations", "Operational Security"],
  },
];

// Wrapper component that handles the useInView hook per timeline item
function TimelineItem({ r, i }: { r: typeof roles[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const isCurrentRole = i === 0;

  return (
    <motion.div
      ref={ref}
      key={i}
      className="relative mb-8 last:mb-0"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
    >
      {/* dot — centered on the border-l line */}
      {isCurrentRole ? (
        <motion.div
          className="absolute -left-8 -translate-x-1/2 top-5 w-3.5 h-3.5 rounded-full border-2"
          style={{
            background: r.accent,
            borderColor: "#0b0f1a",
          }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(245,158,11,0)",
              "0 0 0 8px rgba(245,158,11,0.25)",
              "0 0 0 0 rgba(245,158,11,0)",
            ],
          }}
          transition={{
            duration: 1.25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ) : (
        <div
          className="absolute -left-8 -translate-x-1/2 top-5 w-3.5 h-3.5 rounded-full border-2"
          style={{
            background: r.accent,
            borderColor: "#0b0f1a",
            boxShadow: `0 0 10px ${r.accentDim}`,
          }}
        />
      )}

      <div
        className="rounded-xl border p-6 transition-colors duration-200"
        style={{ background: "#101625", borderColor: "#1a2540" }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = r.accent + "55")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "#1a2540")}
      >
        <div className="flex justify-between items-start gap-4 mb-4 flex-wrap">
          <div>
            <h3 className="font-mono font-bold text-base mb-1" style={{ color: "#f1f5f9" }}>{r.title}</h3>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {r.org}{r.sub && <span style={{ color: "#2d3f5a" }}> · {r.sub}</span>}
            </p>
          </div>
          <span
            className="font-mono text-xs px-3 py-1 rounded shrink-0"
            style={{ background: r.accentDim, color: r.accent, border: `1px solid ${r.accentBorder}` }}
          >
            {r.date}
          </span>
        </div>

        <ul className="space-y-1.5 mb-4">
          {r.bullets.map((b, j) => (
            <li key={j} className="text-sm pl-4 relative" style={{ color: "#64748b" }}>
              <span className="absolute left-0 font-bold" style={{ color: "#3b82f6" }}>›</span>
              <span dangerouslySetInnerHTML={{ __html: b.replace(/<strong>/g, '<strong style="color:#f1f5f9">') }} />
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-1.5">
          {r.tags.map(t => (
            <span
              key={t}
              className="font-mono text-xs px-2 py-0.5 rounded"
              style={{ background: "rgba(139,92,246,0.08)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.18)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Experience() {
  return (
    <section id="experience" className="py-24" style={{ background: "#0b0f1a" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#3b82f6" }}>02 / Experience</p>
        <h2
          className="font-mono font-bold tracking-tight mb-12"
          style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#f1f5f9" }}
        >
          Career History
        </h2>

        <div className="relative pl-8 border-l" style={{ borderColor: "#1a2540" }}>
          {roles.map((r, i) => (
            <TimelineItem key={i} r={r} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
