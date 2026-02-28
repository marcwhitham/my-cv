"use client";
import Image from "next/image";
import { useState } from "react";
import { IconMail, IconPhone, IconLinkedIn, IconMapPin, IconSend } from "@/components/icons";

const contactRows = [
  { label: "Email",    value: "marcwhitham@outlook.com", href: "mailto:marcwhitham@outlook.com", Icon: IconMail    },
  { label: "Phone",    value: "07917 197537",            href: "tel:07917197537",               Icon: IconPhone   },
  { label: "LinkedIn", value: "Marc Whitham",            href: "#",                             Icon: IconLinkedIn},
  { label: "Location", value: "Hampshire, PO12",         href: undefined,                       Icon: IconMapPin  },
];

export function Contact() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("ok");
  }

  return (
    <section id="contact" className="py-24" style={{ background: "#060810" }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#3b82f6" }}>05 / Contact</p>
        <h2 className="font-mono font-bold tracking-tight mb-12" style={{ fontSize: "clamp(1.8rem,3vw,2.5rem)", color: "#f1f5f9" }}>
          Get In Touch
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              I am available for Principal Security Consultant, Secure by Design architecture,
              GRC advisory and MoD programme roles. I have extensive experience working under
              NDA at Official, Secret and above classifications.
            </p>

            {/* Contact image */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#1a2540" }}>
              <Image
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=560&q=75"
                alt="Global network connections"
                width={560}
                height={315}
                className="w-full object-cover"
                style={{ aspectRatio: "16/9", filter: "brightness(0.45) saturate(0.6)" }}
              />
            </div>

            {/* Contact details with icons */}
            <div className="rounded-xl border p-5 space-y-3.5" style={{ background: "#101625", borderColor: "#1a2540" }}>
              {contactRows.map(({ label, value, href, Icon }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: "#162030", color: "#3b82f6", border: "1px solid #1a2540" }}>
                    <Icon size={13} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs leading-none mb-0.5" style={{ color: "#2d3f5a" }}>{label}</span>
                    {href
                      ? <a href={href} className="text-sm" style={{ color: "#f1f5f9" }}>{value}</a>
                      : <span className="text-sm" style={{ color: "#64748b" }}>{value}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border p-5" style={{ background: "#101625", borderColor: "#1a2540" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                <span className="font-mono text-xs font-semibold" style={{ color: "#10b981" }}>Available Q2 2026</span>
              </div>
              <p className="text-xs" style={{ color: "#64748b" }}>
                Open to SC / DV-cleared defence engagements, Secure by Design contracts,
                and senior security leadership roles.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 rounded-xl border p-8 flex flex-col gap-5"
            style={{ background: "#101625", borderColor: "#1a2540" }}>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field id="fname" label="Name" type="text" placeholder="Your name" required />
              <Field id="femail" label="Email" type="email" placeholder="your@email.com" required />
            </div>
            <Field id="forg" label="Organisation" type="text" placeholder="Company or department" />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="ftype" className="text-xs font-medium tracking-wide" style={{ color: "#64748b" }}>Engagement type</label>
              <select id="ftype" className="rounded-lg px-4 py-3 text-sm outline-none border focus:border-blue-500 transition-colors"
                style={{ background: "#162030", borderColor: "#1a2540", color: "#f1f5f9" }}>
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
              <label htmlFor="fmsg" className="text-xs font-medium tracking-wide" style={{ color: "#64748b" }}>Message</label>
              <textarea id="fmsg" rows={5} required placeholder="Outline the engagement or opportunity…"
                className="rounded-lg px-4 py-3 text-sm outline-none border focus:border-blue-500 transition-colors resize-vertical"
                style={{ background: "#162030", borderColor: "#1a2540", color: "#f1f5f9" }} />
            </div>

            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: "#3b82f6", color: "#fff" }}>
              Send Message
              <IconSend size={15} />
            </button>

            {status === "ok" && (
              <p className="text-center text-sm rounded-lg py-2 px-4"
                style={{ background: "rgba(16,185,129,0.10)", color: "#10b981", border: "1px solid rgba(16,185,129,0.20)" }}>
                Message sent — I&apos;ll be in touch shortly.
              </p>
            )}
          </form>
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
      <label htmlFor={id} className="text-xs font-medium tracking-wide" style={{ color: "#64748b" }}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} required={required}
        className="rounded-lg px-4 py-3 text-sm outline-none border focus:border-blue-500 transition-colors"
        style={{ background: "#162030", borderColor: "#1a2540", color: "#f1f5f9" }} />
    </div>
  );
}
