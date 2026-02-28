const specialisms = [
  "Secure by Design", "Threat & Vulnerability Mgmt", "Risk Management",
  "MoD Security Policy", "Security Architecture", "Info Asset Assurance",
  "Stakeholder Engagement", "Line Management", "Critical Infrastructure",
];

export function About() {
  return (
    <section id="about" className="py-24" style={{ background: "#060810" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#3b82f6" }}>01 / About</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#f1f5f9" }}>
          Professional Profile
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 text-sm leading-relaxed" style={{ color: "#64748b" }}>
            <p>
              I am a Principal Security Consultant with over{" "}
              <strong style={{ color: "#f1f5f9" }}>27 years of experience in the Ministry of Defence</strong>,
              specialising in technical security and Secure by Design. I am currently an active participant in the
              MoD Secure by Design deployment, directly involved in the rollout of the MoD&apos;s transformative
              Secure by Design Methodology — a fundamental shift from legacy accreditation practices.
            </p>
            <p>
              As the{" "}
              <strong style={{ color: "#f1f5f9" }}>
                Principal Secure by Design Architect for the Royal Navy Training Management Group
              </strong>
              , I am responsible for the security of numerous training estates across the UK, overseeing both
              concept and live service networks including a Central Security Operations Centre.
            </p>
            <p>
              My work delivers{" "}
              <strong style={{ color: "#f1f5f9" }}>
                State of the Art Training IT solutions that directly impact front-line UK Defence operations
              </strong>{" "}
              — combining deep technical expertise with effective stakeholder engagement and excellence in risk
              management within complex, mission-critical environments.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border p-5" style={{ background: "#101625", borderColor: "#1a2540" }}>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Contact</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Email",    value: "marcwhitham@outlook.com", href: "mailto:marcwhitham@outlook.com" },
                  { label: "Phone",    value: "07917 197537",            href: "tel:07917197537" },
                  { label: "LinkedIn", value: "Marc Whitham",            href: "#" },
                  { label: "Location", value: "Hampshire, PO12",         href: undefined },
                ].map((r) => (
                  <div key={r.label} className="flex gap-3 items-baseline text-sm">
                    <span className="font-mono text-xs min-w-[54px]" style={{ color: "#2d3f5a" }}>{r.label}</span>
                    {r.href
                      ? <a href={r.href} style={{ color: "#3b82f6" }}>{r.value}</a>
                      : <span style={{ color: "#64748b" }}>{r.value}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-5" style={{ background: "#101625", borderColor: "#1a2540" }}>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Core Specialisms</h3>
              <div className="flex flex-wrap gap-1.5">
                {specialisms.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-md border"
                    style={{ background: "#162030", color: "#64748b", borderColor: "#1a2540" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
