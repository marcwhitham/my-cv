"use client";

const certs = [
  "CISSP",
  "CISM",
  "ISO 27001 Lead Implementer",
  "NIST RMF",
  "CompTIA Security+",
  "Secure by Design",
  "JSP 440",
  "JSP 453",
  "JSP 604",
  "SOC Lead Analyst",
  "STRAP",
  "Defence CMI",
  "NCSC Practitioner",
  "Cyber Essentials Plus",
];

export function CertMarquee() {
  return (
    <section
      style={{
        background: "var(--background)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
      className="py-8 w-full"
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          style={{ animation: "marquee 30s linear infinite" }}
          className="flex gap-3 w-max"
        >
          {[...certs, ...certs].map((cert, i) => (
            <span
              key={i}
              className="font-mono text-xs px-3 py-1.5 border whitespace-nowrap"
              style={{
                background: "var(--surface2)",
                color: "var(--muted)",
                borderColor: "var(--border)",
              }}
            >
              {cert}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
