"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const skillBlocks = [
  {
    title: "Security Architecture & Design",
    skills: [
      "Secure by Design (MoD / JSP 440)",
      "Security Architecture (ISO 27001 / NIST)",
      "Cloud Security (Azure / AWS)",
      "Physical & Virtual Network Security",
    ],
  },
  {
    title: "Risk & Compliance",
    skills: [
      "Threat & Vulnerability Management",
      "NIST CMF / RMF",
      "MoD Accreditation (JSP440/604/453)",
      "Information Asset Assurance",
    ],
  },
  {
    title: "Leadership & Management",
    skills: [
      "Team Leadership & Line Management",
      "Stakeholder Engagement",
      "Project Management",
      "Mentorship & Training",
    ],
  },
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

export function Skills() {
  return (
    <section id="skills" className="py-24" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "var(--blue)" }}>03 / Skills</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--foreground)" }}>
          Technical &amp; Professional Expertise
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {skillBlocks.map((block, index) => (
            <motion.div
              key={block.title}
              className="border p-6"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <h3 className="font-mono font-semibold text-sm mb-5" style={{ color: "var(--foreground)" }}>
                {block.title}
              </h3>
              <ul className="space-y-3">
                {block.skills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: "var(--blue)", fontSize: "0.7rem" }}>›</span>
                    <span className="text-sm leading-snug" style={{ color: "var(--muted)" }}>{skill}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Image strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {imageStrip.map(({ src, alt, caption }, index) => (
            <motion.div
              key={caption}
              className="relative overflow-hidden border"
              style={{ borderColor: "var(--border)" }}
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
                <p className="w-full px-3 py-2 font-mono text-xs" style={{ color: "var(--muted)", background: "rgba(6,8,16,0.6)" }}>
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
