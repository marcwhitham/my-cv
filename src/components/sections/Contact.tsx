"use client";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { IconMail, IconPhone, IconLinkedIn, IconMapPin, IconSend } from "@/components/icons";

const contactRows = [
  { label: "Email",    value: "marcwhitham@outlook.com", href: "mailto:marcwhitham@outlook.com", Icon: IconMail    },
  { label: "Phone",    value: "07917 197537",            href: "tel:07917197537",               Icon: IconPhone   },
  { label: "LinkedIn", value: "Marc Whitham",            href: undefined,                       Icon: IconLinkedIn},
  { label: "Location", value: "Hampshire, PO12",         href: undefined,                       Icon: IconMapPin  },
];

export function Contact() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("ok");
  }

  return (
    <section id="contact" className="py-24" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "var(--blue)" }}>06 / Contact</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "var(--foreground)" }}>
          Get In Touch
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left */}
          <motion.div
            className="lg:col-span-2 flex flex-col gap-6"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              I am available for Principal Security Consultant, Secure by Design architecture,
              GRC advisory and MoD programme roles. I have extensive experience working under
              NDA at Official, Secret and above classifications.
            </p>

            {/* Contact image */}
            <div className="overflow-hidden border" style={{ borderColor: "var(--border)" }}>
              <Image
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=560&q=75"
                alt="Global network connections"
                width={560}
                height={315}
                className="w-full object-cover"
                style={{ aspectRatio: "16/9", filter: "brightness(0.45) saturate(0.6)" }}
              />
            </div>

            {/* Contact details */}
            <div className="border p-5 space-y-3.5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              {contactRows.map(({ label, value, href, Icon }, index) => (
                <motion.div
                  key={label}
                  className="flex items-center gap-3 text-sm"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                >
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--surface2)", color: "var(--blue)", border: "1px solid var(--border)" }}>
                    <Icon size={13} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs leading-none mb-0.5" style={{ color: "var(--dim)" }}>{label}</span>
                    {href
                      ? <a href={href} className="text-sm" style={{ color: "var(--foreground)" }}>{value}</a>
                      : <span className="text-sm" style={{ color: "var(--muted)" }}>{value}</span>}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                <span className="font-mono text-xs font-semibold" style={{ color: "var(--green)" }}>Available Q2 2026</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Open to SC / DV-cleared defence engagements, Secure by Design contracts,
                and senior security leadership roles.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="lg:col-span-3 border p-8 flex flex-col gap-5"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field id="fname" label="Name" type="text" placeholder="Your name" required />
              <Field id="femail" label="Email" type="email" placeholder="your@email.com" required />
            </div>
            <Field id="forg" label="Organisation" type="text" placeholder="Company or department" />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ftype" className="text-xs font-medium tracking-wide" style={{ color: "var(--muted)" }}>Engagement type</label>
              <select id="ftype" className="px-4 py-3 text-sm outline-none border focus:border-blue-500 transition-colors"
                style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                <option value="">Select…</option>
                <option>Secure by Design Architecture</option>
                <option>Principal Security Consultant</option>
                <option>MoD / Defence Programme</option>
                <option>Risk &amp; Compliance Advisory</option>
                <option>SOC / Security Operations</option>
                <option>Cloud Security Assessment</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="fmsg" className="text-xs font-medium tracking-wide" style={{ color: "var(--muted)" }}>Message</label>
              <textarea id="fmsg" rows={5} required placeholder="Outline the engagement or opportunity…"
                className="px-4 py-3 text-sm outline-none border focus:border-blue-500 transition-colors resize-vertical"
                style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--blue)", color: "#fff" }}>
              Send Message
              <IconSend size={15} />
            </button>

            {status === "ok" && (
              <p className="text-center text-sm py-2 px-4"
                style={{ background: "rgba(16,185,129,0.10)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.20)" }}>
                Message sent — I&apos;ll be in touch shortly.
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function Field({ id, label, type, placeholder, required }: {
  id: string; label: string; type: string; placeholder: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium tracking-wide" style={{ color: "var(--muted)" }}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} required={required}
        className="px-4 py-3 text-sm outline-none border focus:border-blue-500 transition-colors"
        style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--foreground)" }} />
    </div>
  );
}
