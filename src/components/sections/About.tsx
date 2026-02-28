"use client";
import Image from "next/image";
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
    <section id="about" className="py-24" style={{ background: "#060810" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#3b82f6" }}>01 / About</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#f1f5f9" }}>
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
            <div className="rounded-xl overflow-hidden border sticky top-24" style={{ borderColor: "#1a2540" }}>
              <Image
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=560&q=80"
                alt="Cybersecurity network visualization"
                width={560}
                height={420}
                className="w-full object-cover"
                style={{ filter: "brightness(0.6) saturate(0.65)" }}
              />
              <div className="p-4 border-t" style={{ borderColor: "#1a2540", background: "#101625" }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse flex-shrink-0" />
                  <span className="font-mono text-xs font-semibold" style={{ color: "#10b981" }}>Available Q2 2026</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            className="space-y-4 text-sm leading-relaxed"
            style={{ color: "#64748b" }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
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
          </motion.div>

          {/* Cards */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="rounded-xl border p-5" style={{ background: "#101625", borderColor: "#1a2540" }}>
              <h3 className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "#64748b" }}>Contact</h3>
              <div className="space-y-3">
                {contactRows.map(({ label, value, href, Icon }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon size={14} className="flex-shrink-0" style={{ color: "#2d3f5a" } as React.CSSProperties} />
                    {href
                      ? <a href={href} style={{ color: "#3b82f6" }}>{value}</a>
                      : <span style={{ color: "#64748b" }}>{value}</span>}
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
          </motion.div>

        </div>
      </div>
    </section>
  );
}
