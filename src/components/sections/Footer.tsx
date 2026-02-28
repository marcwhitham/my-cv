import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t py-8" style={{ background: "#0b0f1a", borderColor: "#1a2540" }}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
        <Image src="/logo.svg" alt="MW" width={32} height={32} style={{ opacity: 0.6 }} />
        <p className="text-sm" style={{ color: "#64748b" }}>© 2026 Marc Whitham · All rights reserved</p>
        <p className="font-mono text-xs" style={{ color: "#2d3f5a" }}>// Principal Security Consultant</p>
      </div>
    </footer>
  );
}
