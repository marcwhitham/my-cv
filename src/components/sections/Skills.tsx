"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

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

const imageStrip = [
  {
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=480&q=70",
    alt: "Code and security matrix",
    caption: "Defence-grade code assurance",
  },
  {
    src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=480&q=70",
    alt: "Network infrastructure",
    caption: "15+ RN networks secured",
  },
  {
    src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=480&q=70",
    alt: "Cyber security operations",
    caption: "Central SOC leadership",
  },
];

function SkillBar({ label, pct }: { label: string; pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref}>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs" style={{ color: "#64748b" }}>{label}</span>
        <span className="font-mono text-xs" style={{ color: "#3b82f6" }}>{pct}%</span>
      </div>
      <div className="h-1 overflow-hidden" style={{ background: "#162030" }}>
        <motion.div
          className="h-full"
          style={{ background: "#3b82f6" }}
          initial={{ width: "0%" }}
          animate={{ width: isInView ? `${pct}%` : "0%" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="py-24" style={{ background: "#060810" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#3b82f6" }}>03 / Skills</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#f1f5f9" }}>
          Technical &amp; Professional Expertise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {skillBlocks.map((block, index) => (
            <motion.div
              key={block.title}
              className="border p-6"
              style={{ background: "#101625", borderColor: "#1a2540" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <h3 className="font-mono font-semibold text-sm mb-5" style={{ color: "#f1f5f9" }}>{block.title}</h3>
              <div className="space-y-3.5">
                {block.bars.map((b) => (
                  <SkillBar key={b.label} label={b.label} pct={b.pct} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Frameworks */}
        <motion.div
          className="border p-6 mb-5"
          style={{ background: "#101625", borderColor: "#1a2540" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
        >
          <h3 className="font-mono font-semibold text-sm mb-4" style={{ color: "#f1f5f9" }}>Standards &amp; Frameworks</h3>
          <div className="flex flex-wrap gap-2">
            {frameworks.map((f) => (
              <span key={f} className="font-mono text-xs px-3 py-1.5 border"
                style={{ background: "#162030", color: "#64748b", borderColor: "#1a2540" }}>
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Image strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {imageStrip.map(({ src, alt, caption }, index) => (
            <motion.div
              key={caption}
              className="relative overflow-hidden border"
              style={{ borderColor: "#1a2540" }}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
            >
              <Image
                src={src}
                alt={alt}
                width={480}
                height={270}
                className="w-full object-cover"
                style={{ aspectRatio: "16/9", filter: "brightness(0.5) saturate(0.6)" }}
              />
              <div className="absolute inset-0 flex items-end">
                <p className="w-full px-3 py-2 font-mono text-xs" style={{ color: "#64748b", background: "rgba(6,8,16,0.6)" }}>
                  // {caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
