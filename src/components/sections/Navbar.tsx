"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { IconDownload } from "@/components/icons";

const links = [
  { href: "#about",         label: "About" },
  { href: "#experience",    label: "Experience" },
  { href: "#skills",        label: "Skills" },
  { href: "#qualifications",label: "Qualifications" },
  { href: "#contact",       label: "Contact" },
];

const sectionIds = ["about", "experience", "skills", "qualifications", "contact"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <div className="w-full text-center py-2 px-4 text-sm flex items-center justify-center gap-4 flex-wrap"
        style={{ background: "#0d1629", borderBottom: "1px solid #1a2540" }}>
        <span style={{ color: "rgba(255,255,255,0.75)" }}>
          I am available for Defence &amp; MoD security engagements from Q2 2026
        </span>
        <a href="#contact" className="text-white font-semibold text-sm flex items-center gap-1"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.4)" }}>
          Get in touch →
        </a>
      </div>

      <nav className="sticky top-0 z-50 w-full"
        style={{
          background: scrolled ? "rgba(6,8,16,0.95)" : "rgba(6,8,16,0.8)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #1a2540",
          transition: "background 0.2s",
        }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
          <a href="#" className="mr-auto" style={{ opacity: 1 }}>
            <Image src="/logo.svg" alt="MW" width={36} height={36} priority />
          </a>
          <ul className="hidden md:flex items-center gap-7 list-none">
            {links.map((l) => {
              const id = l.href.slice(1);
              return (
                <li key={l.href}>
                  <a href={l.href} className="text-sm font-medium"
                    style={{
                      color: active === id ? "#f1f5f9" : "#64748b",
                      borderBottom: active === id ? "2px solid #f59e0b" : "2px solid transparent",
                      paddingBottom: "2px",
                      transition: "color 0.2s, border-color 0.2s",
                    }}>
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <a href="/marc-whitham-cv.pdf" download
            className="flex items-center gap-2 text-sm font-bold px-5 py-2 transition-transform hover:-translate-y-px"
            style={{ background: "#f59e0b", color: "#000" }}>
            <IconDownload size={14} />
            Download CV
          </a>
        </div>
      </nav>
    </>
  );
}
