"use client";
import { motion } from "framer-motion";
import { IconMail, IconPhone, IconLinkedIn, IconMapPin } from "@/components/icons";

const specialisms = [
  "Secure by Design", "Threat & Vulnerability Mgmt", "Risk Management",
  "MoD Security Policy", "Security Architecture", "Info Asset Assurance",
  "Stakeholder Engagement", "Line Management", "Critical Infrastructure",
];

const contactRows = [
  { label: "Email",    value: "marcwhitham@outlook.com", href: "mailto:marcwhitham@outlook.com", Icon: IconMail    },
  { label: "Phone",    value: "07917 197537",            href: "tel:07917197537",               Icon: IconPhone   },
  { label: "LinkedIn", value: "Marc Whitham",            href: "#",                             Icon: IconLinkedIn},
  { label: "Location", value: "Hampshire, PO12",         href: undefined,                       Icon: IconMapPin  },
];

export function About() {
  return (
    <section id="about" className="py-24" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "var(--blue)" }}>01 / About</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--foreground)" }}>
          Professional Profile
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Image column */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <div className="overflow-hidden border sticky top-24" style={{ borderColor: "var(--border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=560&q=80"
                alt="Cybersecurity network visualization"
                width={560}
                height={420}
                className="w-full object-cover"
                style={{ filter: "brightness(0.6) saturate(0.65)" }}
              />
              <div className="p-4 border-t" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse flex-shrink-0" />
                  <span className="font-mono text-xs font-semibold" style={{ color: "var(--green)" }}>Available Q2 2026</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            className="space-y-4 text-sm leading-relaxed"
            style={{ color: "var(--muted)" }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p>
              I am a Principal Security Consultant with over{" "}
              <strong style={{ color: "var(--foreground)" }}>27 years of experience in the Ministry of Defence</strong>,
              specialising in technical security and Secure by Design. I am currently an active participant in the
              MoD Secure by Design deployment, directly involved in the rollout of the MoD&apos;s transformative
              Secure by Design Methodology — a fundamental shift from legacy accreditation practices.
            </p>
            <p>
              As the{" "}
              <strong style={{ color: "var(--foreground)" }}>
                Principal Secure by Design Architect for the Royal Navy Training Management Group
              </strong>
              , I am responsible for the security of numerous training estates across the UK, overseeing both
              concept and live service networks including a Central Security Operations Centre.
            </p>
            <p>
              My work delivers{" "}
              <strong style={{ color: "var(--foreground)" }}>
                State of the Art Training IT solutions that directly impact front-line UK Defence operations
              </strong>{" "}
              — combining deep technical expertise with effective stakeholder engagement and excellence in risk
              management within complex, mission-critical environments.
            </p>
          </motion.div>

          {/* Cards */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>Contact</h3>
              <div className="space-y-3">
                {contactRows.map(({ label, value, href, Icon }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon size={14} className="flex-shrink-0" style={{ color: "var(--dim)" } as React.CSSProperties} />
                    {href
                      ? <a href={href} style={{ color: "var(--blue)" }}>{value}</a>
                      : <span style={{ color: "var(--muted)" }}>{value}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>Core Specialisms</h3>
              <div className="flex flex-wrap gap-1.5">
                {specialisms.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 border"
                    style={{ background: "var(--surface2)", color: "var(--muted)", borderColor: "var(--border)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
