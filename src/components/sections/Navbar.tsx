"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { IconDownload } from "@/components/icons";

const links = [
  { href: "#about",          label: "About" },
  { href: "#skills",         label: "Skills" },
  { href: "#qualifications", label: "Qualifications" },
  { href: "#experience",     label: "Experience" },
  { href: "#contact",        label: "Contact" },
];

const sectionIds = ["about", "skills", "qualifications", "experience", "contact"];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-75"
      style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
      aria-label="Toggle colour theme"
    >
      {isDark ? (
        /* Sun icon */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1"  x2="12" y2="3"  />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1"  y1="12" x2="3"  y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"  />
          <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
        </svg>
      ) : (
        /* Moon icon */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

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
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}>
        <span style={{ color: "var(--muted)" }}>
          I am available for Defence &amp; MoD security engagements from Q2 2026
        </span>
        <a href="#contact" className="font-semibold text-sm flex items-center gap-1"
          style={{ color: "var(--foreground)", borderBottom: "1px solid var(--muted)" }}>
          Get in touch →
        </a>
      </div>

      <nav className="sticky top-0 z-50 w-full"
        style={{
          background: scrolled ? "var(--nav-scroll-bg)" : "var(--nav-base-bg)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
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
                      color: active === id ? "var(--foreground)" : "var(--muted)",
                      borderBottom: active === id ? "2px solid var(--gold)" : "2px solid transparent",
                      paddingBottom: "2px",
                      transition: "color 0.2s, border-color 0.2s",
                    }}>
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <ThemeToggle />
          <a href="/marc-whitham-cv.pdf" download
            className="flex items-center gap-2 text-sm font-bold px-5 py-2 transition-transform hover:-translate-y-px"
            style={{ background: "var(--gold)", color: "#000" }}>
            <IconDownload size={14} />
            Download CV
          </a>
        </div>
      </nav>
    </>
  );
}
