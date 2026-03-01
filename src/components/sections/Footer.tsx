import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
        <Image src="/logo.svg" alt="MW" width={32} height={32} style={{ opacity: 0.6 }} />
        <p className="text-sm" style={{ color: "var(--muted)" }}>© 2026 Marc Whitham · All rights reserved</p>
        <p className="font-mono text-xs" style={{ color: "var(--dim)" }}>// Principal Security Consultant</p>
      </div>
    </footer>
  );
}
