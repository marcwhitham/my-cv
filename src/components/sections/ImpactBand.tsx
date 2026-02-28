"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const impacts = [
  { value: "27+", label: "Years MoD Service", icon: "⚔️" },
  { value: "15+", label: "Networks Secured", icon: "🛡" },
  { value: "10+", label: "Certifications", icon: "🏅" },
  { value: "SC/DV", label: "Clearance Level", icon: "🔐" },
];

export function ImpactBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        background: "#0b0f1a",
        borderTop: "1px solid #1a2540",
        borderBottom: "1px solid #1a2540",
      }}
      className="py-10 w-full"
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {impacts.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <span className="text-2xl" aria-hidden="true">
                {item.icon}
              </span>
              <span
                className="font-mono font-bold text-4xl leading-none"
                style={{ color: "#f59e0b" }}
              >
                {item.value}
              </span>
              <span
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: "#64748b" }}
              >
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
