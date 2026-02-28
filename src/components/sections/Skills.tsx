const skillBlocks = [
  {
    title: "Security Architecture & Design",
    bars: [
      { label: "Secure by Design (MoD / JSP 440)", pct: 97 },
      { label: "Security Architecture (ISO 27001 / NIST)", pct: 95 },
      { label: "Cloud Security (Azure / AWS)", pct: 85 },
      { label: "Physical & Virtual Network Security", pct: 90 },
    ],
  },
  {
    title: "Risk & Compliance",
    bars: [
      { label: "Threat & Vulnerability Management", pct: 95 },
      { label: "NIST CMF / RMF", pct: 93 },
      { label: "MoD Accreditation (JSP440/604/453)", pct: 97 },
      { label: "Information Asset Assurance", pct: 92 },
    ],
  },
  {
    title: "Leadership & Management",
    bars: [
      { label: "Team Leadership & Line Management", pct: 95 },
      { label: "Stakeholder Engagement", pct: 90 },
      { label: "Project Management", pct: 88 },
      { label: "Mentorship & Training", pct: 93 },
    ],
  },
];

const frameworks = [
  "JSP 440 / 453 / 604", "ISO 27001", "NIST 800 Series", "NIST CMF & RMF",
  "NCSC Guidance", "STRAP", "SOC Operations", "Cyber Assurance Review Board",
  "SQEP Workforce Management", "Defence CMI",
];

export function Skills() {
  return (
    <section id="skills" className="py-24" style={{ background: "#060810" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#3b82f6" }}>03 / Skills</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#f1f5f9" }}>
          Technical &amp; Professional Expertise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {skillBlocks.map((block) => (
            <div key={block.title} className="rounded-xl border p-6" style={{ background: "#101625", borderColor: "#1a2540" }}>
              <h3 className="font-mono font-semibold text-sm mb-5" style={{ color: "#f1f5f9" }}>{block.title}</h3>
              <div className="space-y-3.5">
                {block.bars.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "#64748b" }}>{b.label}</span>
                      <span className="font-mono text-xs" style={{ color: "#3b82f6" }}>{b.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "#162030" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.pct}%`, background: "#3b82f6" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Frameworks bento */}
        <div className="rounded-xl border p-6" style={{ background: "#101625", borderColor: "#1a2540" }}>
          <h3 className="font-mono font-semibold text-sm mb-4" style={{ color: "#f1f5f9" }}>Standards &amp; Frameworks</h3>
          <div className="flex flex-wrap gap-2">
            {frameworks.map((f) => (
              <span key={f} className="font-mono text-xs px-3 py-1.5 rounded-lg border"
                style={{ background: "#162030", color: "#64748b", borderColor: "#1a2540" }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
