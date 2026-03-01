"use client";

import {
  leftToCenter,
  rightToCenter,
  distributeY,
  clusterDots,
  circlePoints,
} from "@/lib/flow-helpers";

// ── SVG canvas ────────────────────────────────────────────────────────────────
const W   = 960;
const H   = 520;
const CX  = 480;   // horizontal centre
const CY  = 260;   // vertical centre

const TOP_Y = 82;
const BOT_Y = 438;

// Connection node positions (dots where the bezier paths start)
const L_NODE = 234;
const R_NODE = 726;

// ── Colour palette (mirrors globals.css) ─────────────────────────────────────
const C = {
  bg:     "#060810",
  surf:   "#101625",
  blue:   "#3b82f6",
  gold:   "#f59e0b",
  dim:    "#2d3f5a",
  muted:  "#64748b",
  fg:     "#f1f5f9",
  border: "#1a2540",
} as const;

const MONO = "'JetBrains Mono', 'Courier New', monospace";

// ── Data ──────────────────────────────────────────────────────────────────────
const LEFT_ITEMS = [
  { label: "Security Architecture", sub: "Secure by Design · JSP 440",  pct: 97 },
  { label: "Risk & Compliance",     sub: "NIST RMF · ISO 27001",         pct: 95 },
  { label: "MoD Accreditation",     sub: "JSP 440 / 453 / 604",          pct: 97 },
  { label: "Team Leadership",       sub: "27+ Years MoD Service",        pct: 95 },
  { label: "Intelligence Ops",      sub: "EW · STRAP · JMIA",            pct: 90 },
];

const RIGHT_ITEMS = [
  { label: "CISM",       sub: "ISACA Certified",       active: true  },
  { label: "ISO 27001",  sub: "Lead Auditor",           active: true  },
  { label: "DV Cleared", sub: "Active · Since 2004",   active: true  },
  { label: "CISSP",      sub: "Info Sec Professional",  active: false },
  { label: "NIST RMF",   sub: "Risk Management Fwk",   active: false },
];

// Labels for the 5 orbital nodes around the hub
const HUB_LABELS = ["27 YRS", "DV", "MoD", "SOC", "RN VET"];

// ── Component ─────────────────────────────────────────────────────────────────
export function SkillFlowGraphic() {
  // Vertical positions for each row
  const leftYs  = LEFT_ITEMS.map((_,  i) => distributeY(i, LEFT_ITEMS.length,  TOP_Y, BOT_Y));
  const rightYs = RIGHT_ITEMS.map((_, i) => distributeY(i, RIGHT_ITEMS.length, TOP_Y, BOT_Y));

  // Bezier path strings
  const lPaths = LEFT_ITEMS.map((_,  i) => leftToCenter(L_NODE,  leftYs[i],  CX, CY));
  const rPaths = RIGHT_ITEMS.map((_, i) => rightToCenter(R_NODE, rightYs[i], CX, CY));

  // Pre-computed geometry
  const dots   = clusterDots(CX, CY, 78, 28, 1337);
  const orbit5 = circlePoints(CX, CY,  92, 5,  -18);
  const orbit8 = circlePoints(CX, CY, 116, 8,   10);

  return (
    <section style={{ background: C.bg, padding: "5rem 0 4rem" }}>
      <div style={{ maxWidth: "76rem", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* Section header */}
        <p style={{
          fontFamily: MONO, fontSize: "0.68rem",
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: C.blue, marginBottom: "0.4rem",
        }}>
          // Capability Intelligence Network
        </p>
        <h2 style={{
          fontFamily: MONO, fontWeight: 700,
          fontSize: "clamp(1.5rem,2.5vw,2rem)",
          color: C.fg, marginBottom: "2rem",
        }}>
          Skills &amp; Competency Map
        </h2>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Skills and competency network diagram"
          role="img"
        >
          {/* ── Defs ── */}
          <defs>
            {/* Dot-grid tile */}
            <pattern id="sf-grid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="11" cy="11" r="0.85" fill={C.dim} opacity="0.45" />
            </pattern>

            {/* Blue glow filter */}
            <filter id="sf-gb" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gold glow filter */}
            <filter id="sf-gg" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Centre radial bloom */}
            <radialGradient id="sf-bloom" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={C.gold} stopOpacity="0.14" />
              <stop offset="50%"  stopColor={C.blue} stopOpacity="0.07" />
              <stop offset="100%" stopColor={C.gold} stopOpacity="0"    />
            </radialGradient>

            {/* Left path geometry — referenced by animateMotion */}
            {lPaths.map((d, i) => (
              <path key={`ld${i}`} id={`sf-lp${i}`} d={d} fill="none" />
            ))}

            {/* Right path geometry */}
            {rPaths.map((d, i) => (
              <path key={`rd${i}`} id={`sf-rp${i}`} d={d} fill="none" />
            ))}
          </defs>

          {/* ── Background ── */}
          <rect width={W} height={H} fill={C.bg} />
          <rect width={W} height={H} fill="url(#sf-grid)" />

          {/* ── Centre ambient bloom ── */}
          <circle cx={CX} cy={CY} r={172} fill="url(#sf-bloom)" />

          {/* ── Connection paths (faint strokes) ── */}
          {lPaths.map((d, i) => (
            <path key={`lp${i}`} d={d} fill="none"
              stroke={C.blue} strokeWidth="0.75" opacity="0.22" />
          ))}
          {rPaths.map((d, i) => (
            <path key={`rp${i}`} d={d} fill="none"
              stroke={C.gold} strokeWidth="0.75" opacity="0.22" />
          ))}

          {/* ── Animated circle travellers ── */}
          {/* Blue travellers — left side, moving toward centre */}
          {lPaths.map((_, i) => (
            <circle key={`lt${i}`} r="3.5" fill={C.blue} filter="url(#sf-gb)">
              <animateMotion
                dur={`${2.6 + i * 0.38}s`}
                begin={`${i * 0.52}s`}
                repeatCount="indefinite"
              >
                <mpath href={`#sf-lp${i}`} />
              </animateMotion>
            </circle>
          ))}

          {/* Gold travellers — right side, moving toward centre */}
          {rPaths.map((_, i) => (
            <circle key={`rt${i}`} r="3.5" fill={C.gold} filter="url(#sf-gg)">
              <animateMotion
                dur={`${3.1 + i * 0.3}s`}
                begin={`${i * 0.58 + 0.25}s`}
                repeatCount="indefinite"
              >
                <mpath href={`#sf-rp${i}`} />
              </animateMotion>
            </circle>
          ))}

          {/* ── Centre cluster scatter dots ── */}
          {dots.map((d, i) => (
            <circle key={`cd${i}`}
              cx={d.x} cy={d.y} r={d.r}
              fill={d.colorIdx === 0 ? C.blue : d.colorIdx === 1 ? C.gold : C.dim}
              opacity={d.opacity}
            />
          ))}

          {/* ══ Centre Hub ══ */}

          {/* Outer dashed ring — slow clockwise spin */}
          <circle cx={CX} cy={CY} r={113} fill="none"
            stroke={C.border} strokeWidth="1" strokeDasharray="4 10">
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`}
              dur="32s" repeatCount="indefinite" />
          </circle>

          {/* Outer orbit: 8 ambient dots */}
          {orbit8.map((pt, i) => (
            <circle key={`o8${i}`}
              cx={pt.x} cy={pt.y}
              r={i % 3 === 0 ? 2.5 : 1.5}
              fill={i % 2 === 0 ? C.dim : C.muted}
              opacity="0.4"
            />
          ))}

          {/* Mid ring */}
          <circle cx={CX} cy={CY} r={90} fill="none"
            stroke={C.border} strokeWidth="0.8" opacity="0.55" />

          {/* Inner orbit: 5 named nodes */}
          {orbit5.map((pt, i) => (
            <g key={`o5${i}`}>
              <circle cx={pt.x} cy={pt.y} r={9}
                fill={C.surf}
                stroke={i < 3 ? C.gold : C.blue}
                strokeWidth="1.2" />
              <circle cx={pt.x} cy={pt.y} r={4}
                fill={i < 3 ? C.gold : C.blue}
                opacity="0.9" />
              <text
                x={pt.x} y={pt.y + 20}
                textAnchor="middle"
                fontFamily={MONO} fontSize="7"
                fill={C.muted} letterSpacing="0.5"
              >
                {HUB_LABELS[i]}
              </text>
            </g>
          ))}

          {/* Inner disc */}
          <circle cx={CX} cy={CY} r={64}
            fill={C.bg} stroke={C.border} strokeWidth="1" />

          {/* Counter-rotating gold dashes on inner disc */}
          <circle cx={CX} cy={CY} r={64}
            fill="none" stroke={C.gold}
            strokeWidth="1.5" strokeDasharray="14 10" strokeOpacity="0.4">
            <animateTransform attributeName="transform" type="rotate"
              from={`360 ${CX} ${CY}`} to={`0 ${CX} ${CY}`}
              dur="16s" repeatCount="indefinite" />
          </circle>

          {/* Core glow halo */}
          <circle cx={CX} cy={CY} r={26} fill={C.gold} opacity="0.07" />

          {/* Core node */}
          <circle cx={CX} cy={CY} r={9}
            fill={C.gold} opacity="0.88" filter="url(#sf-gg)" />

          {/* Hub identity */}
          <text x={CX} y={CY + 30} textAnchor="middle"
            fontFamily={MONO} fontSize="8" fill={C.muted} letterSpacing="2">
            MARC WHITHAM
          </text>
          <text x={CX} y={CY + 43} textAnchor="middle"
            fontFamily={MONO} fontSize="7" fill={C.gold} letterSpacing="1">
            PRINCIPAL · DV CLEARED
          </text>

          {/* ── Left column ── */}
          <text x={L_NODE - 18} y="44" textAnchor="end"
            fontFamily={MONO} fontSize="8" fill={C.dim} letterSpacing="1.5">
            EXPERTISE DOMAINS
          </text>
          {LEFT_ITEMS.map((item, i) => (
            <g key={`li${i}`}>
              {/* Endpoint node dot */}
              <circle cx={L_NODE} cy={leftYs[i]} r={5.5}
                fill={C.surf} stroke={C.blue} strokeWidth="1.5" />
              <circle cx={L_NODE} cy={leftYs[i]} r={2.5} fill={C.blue} />
              {/* Label */}
              <text x={L_NODE - 18} y={leftYs[i] - 9} textAnchor="end"
                fontFamily={MONO} fontSize="11" fill={C.fg} fontWeight="600">
                {item.label}
              </text>
              <text x={L_NODE - 18} y={leftYs[i] + 6} textAnchor="end"
                fontFamily={MONO} fontSize="8.5" fill={C.muted}>
                {item.sub}
              </text>
              <text x={L_NODE - 18} y={leftYs[i] + 20} textAnchor="end"
                fontFamily={MONO} fontSize="8" fill={C.blue}>
                {item.pct}%
              </text>
            </g>
          ))}

          {/* ── Right column ── */}
          <text x={R_NODE + 18} y="44"
            fontFamily={MONO} fontSize="8" fill={C.dim} letterSpacing="1.5">
            QUALIFICATIONS
          </text>
          {RIGHT_ITEMS.map((item, i) => (
            <g key={`ri${i}`}>
              {/* Endpoint node dot */}
              <circle cx={R_NODE} cy={rightYs[i]} r={5.5}
                fill={C.surf}
                stroke={item.active ? C.gold : C.dim}
                strokeWidth="1.5" />
              <circle cx={R_NODE} cy={rightYs[i]} r={2.5}
                fill={item.active ? C.gold : C.dim} />
              {/* Label */}
              <text x={R_NODE + 18} y={rightYs[i] - 9}
                fontFamily={MONO} fontSize="11" fill={C.fg} fontWeight="600">
                {item.label}
              </text>
              <text x={R_NODE + 18} y={rightYs[i] + 6}
                fontFamily={MONO} fontSize="8.5" fill={C.muted}>
                {item.sub}
              </text>
              {item.active && (
                <text x={R_NODE + 18} y={rightYs[i] + 20}
                  fontFamily={MONO} fontSize="8" fill={C.gold}>
                  ● ACTIVE
                </text>
              )}
            </g>
          ))}

          {/* ── Centre column header ── */}
          <text x={CX} y="44" textAnchor="middle"
            fontFamily={MONO} fontSize="8" fill={C.dim} letterSpacing="1.5">
            CAPABILITY HUB
          </text>

          {/* ── Footnote ── */}
          <text x={W - 10} y={H - 8} textAnchor="end"
            fontFamily={MONO} fontSize="7" fill={C.dim}>
            Fig. 1.1 — Capability Network
          </text>
        </svg>
      </div>
    </section>
  );
}
