"use client";
import { useEffect, useRef } from "react";

// ─── types ───────────────────────────────────────────────────────────────────
type IconType = "shield" | "lock" | "server" | "hub" | "eye" | "chip";

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  icon: IconType;
  pulseR: number; pulseA: number; nextPulse: number;
}

interface Packet { ai: number; bi: number; t: number; }

// ─── constants ────────────────────────────────────────────────────────────────
const NODE_R       = 15;          // circle radius around icon
const MAX_DIST     = 220;         // connection threshold
const PACKET_SPEED = 0.0038;      // fraction of edge per frame
const BLUE         = "#3b82f6";
const BLUE_GLOW    = "rgba(59,130,246,0.32)";
const GOLD         = "#f59e0b";
const BG_NODE      = "#0c1322";
const ICONS: IconType[] = [
  "shield", "lock", "server", "hub", "eye", "chip", "shield", "lock", "eye",
];

// ─── icon renderer ────────────────────────────────────────────────────────────
// All icons are designed for a ±8 logical-pixel box centered on (cx, cy).
function drawIcon(ctx: CanvasRenderingContext2D, icon: IconType, cx: number, cy: number) {
  ctx.strokeStyle = BLUE;
  ctx.fillStyle   = BLUE;
  ctx.lineWidth   = 1.4;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.globalAlpha = 0.72;

  switch (icon) {
    case "shield":
      ctx.beginPath();
      ctx.moveTo(cx, cy - 7);
      ctx.lineTo(cx - 5, cy - 3.5);
      ctx.lineTo(cx - 5, cy + 1.5);
      ctx.quadraticCurveTo(cx, cy + 8, cx, cy + 8);
      ctx.quadraticCurveTo(cx, cy + 8, cx + 5, cy + 1.5);
      ctx.lineTo(cx + 5, cy - 3.5);
      ctx.closePath();
      ctx.stroke();
      // checkmark inside
      ctx.beginPath();
      ctx.moveTo(cx - 2.5, cy + 1);
      ctx.lineTo(cx - 0.5, cy + 3.5);
      ctx.lineTo(cx + 3, cy - 1.5);
      ctx.stroke();
      break;

    case "lock":
      // shackle arc
      ctx.beginPath();
      ctx.arc(cx, cy - 2.5, 3.5, Math.PI, 0);
      ctx.stroke();
      // body
      ctx.beginPath();
      ctx.rect(cx - 4.5, cy - 0.5, 9, 7);
      ctx.stroke();
      // keyhole dot
      ctx.beginPath();
      ctx.arc(cx, cy + 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "server":
      ctx.beginPath(); ctx.rect(cx - 5.5, cy - 7, 11, 5); ctx.stroke();
      ctx.beginPath(); ctx.rect(cx - 5.5, cy + 0.5, 11, 5); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx - 2.5, cy - 4.5, 1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 2.5, cy + 3, 1, 0, Math.PI * 2); ctx.fill();
      break;

    case "hub": {
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      const spokes = 4;
      for (let s = 0; s < spokes; s++) {
        const a = (s / spokes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + 2.5 * Math.cos(a), cy + 2.5 * Math.sin(a));
        ctx.lineTo(cx + 6.2 * Math.cos(a), cy + 6.2 * Math.sin(a));
        ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 7 * Math.cos(a), cy + 7 * Math.sin(a), 1.2, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    case "eye":
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy);
      ctx.bezierCurveTo(cx - 3.5, cy - 5, cx + 3.5, cy - 5, cx + 7, cy);
      ctx.bezierCurveTo(cx + 3.5, cy + 5, cx - 3.5, cy + 5, cx - 7, cy);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
      break;

    case "chip":
      ctx.beginPath(); ctx.rect(cx - 4.5, cy - 4.5, 9, 9); ctx.stroke();
      // pins (3 per side)
      for (let p = -1; p <= 1; p++) {
        ctx.beginPath(); ctx.moveTo(cx + p * 3, cy - 4.5); ctx.lineTo(cx + p * 3, cy - 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + p * 3, cy + 4.5); ctx.lineTo(cx + p * 3, cy + 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 4.5, cy + p * 3); ctx.lineTo(cx - 7, cy + p * 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 4.5, cy + p * 3); ctx.lineTo(cx + 7, cy + p * 3); ctx.stroke();
      }
      break;
  }

  ctx.globalAlpha = 1;
}

// ─── component ────────────────────────────────────────────────────────────────
export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let w = 0, h = 0, dpr = 1, raf = 0;
    let nodes: Node[] | null = null;
    const packets: Packet[]  = [];
    const liveConns          = new Set<string>();

    // ── resize: reset transform each time so scale doesn't accumulate ──────
    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ── lazy node init after first resize gives correct w/h ─────────────────
    function initNodes(now: number): Node[] {
      return ICONS.map((icon) => {
        const angle = Math.random() * Math.PI * 2;
        const spd   = 0.1 + Math.random() * 0.16;
        return {
          x: NODE_R + Math.random() * (w - NODE_R * 2),
          y: NODE_R + Math.random() * (h - NODE_R * 2),
          vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
          icon,
          pulseR: 0, pulseA: 0,
          nextPulse: now + 800 + Math.random() * 5000,
        };
      });
    }

    function frame(now: number) {
      if (!nodes) nodes = initNodes(now);
      ctx.clearRect(0, 0, w, h);

      // ── update nodes ──────────────────────────────────────────────────────
      for (const nd of nodes) {
        nd.x += nd.vx; nd.y += nd.vy;
        if (nd.x < NODE_R + 4)     { nd.x = NODE_R + 4;     nd.vx =  Math.abs(nd.vx); }
        if (nd.x > w - NODE_R - 4) { nd.x = w - NODE_R - 4; nd.vx = -Math.abs(nd.vx); }
        if (nd.y < NODE_R + 4)     { nd.y = NODE_R + 4;     nd.vy =  Math.abs(nd.vy); }
        if (nd.y > h - NODE_R - 4) { nd.y = h - NODE_R - 4; nd.vy = -Math.abs(nd.vy); }

        if (now >= nd.nextPulse) {
          nd.pulseR = NODE_R; nd.pulseA = 0.45;
          nd.nextPulse = now + 5000 + Math.random() * 6000;
        }
        if (nd.pulseA > 0) { nd.pulseR += 0.5; nd.pulseA -= 0.006; if (nd.pulseA < 0) nd.pulseA = 0; }
      }

      // ── connections ───────────────────────────────────────────────────────
      const newConns = new Set<string>();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[j].x - nodes[i].x;
          const dy   = nodes[j].y - nodes[i].y;
          const dist = Math.hypot(dx, dy);
          if (dist >= MAX_DIST) continue;

          const key = `${i}-${j}`;
          newConns.add(key);
          const alpha = (1 - dist / MAX_DIST) * 0.28;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = BLUE;
          ctx.lineWidth   = 1;
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = -(now / 40); // flowing dash animation
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
          ctx.restore();

          // spawn a packet the moment a connection forms (if not already one)
          if (!liveConns.has(key) && !packets.some(p => p.ai === i && p.bi === j)) {
            packets.push({ ai: i, bi: j, t: Math.random() });
          }
        }
      }

      // prune packets whose connection dropped
      for (let p = packets.length - 1; p >= 0; p--) {
        const { ai, bi } = packets[p];
        if (!newConns.has(`${ai}-${bi}`)) packets.splice(p, 1);
      }
      liveConns.clear();
      newConns.forEach(k => liveConns.add(k));

      // ── packets ───────────────────────────────────────────────────────────
      for (const pkt of packets) {
        pkt.t = (pkt.t + PACKET_SPEED) % 1;
        const a = nodes[pkt.ai], b = nodes[pkt.bi];
        const px = a.x + (b.x - a.x) * pkt.t;
        const py = a.y + (b.y - a.y) * pkt.t;

        ctx.save();
        ctx.shadowBlur  = 8;
        ctx.shadowColor = GOLD;
        ctx.fillStyle   = GOLD;
        ctx.globalAlpha = 0.88;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── nodes ─────────────────────────────────────────────────────────────
      for (const nd of nodes) {
        // pulse ring
        if (nd.pulseA > 0) {
          ctx.save();
          ctx.globalAlpha = nd.pulseA;
          ctx.strokeStyle = BLUE;
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, nd.pulseR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // glow + dark fill
        ctx.save();
        ctx.shadowBlur  = 14;
        ctx.shadowColor = BLUE_GLOW;
        ctx.fillStyle   = BG_NODE;
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, NODE_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // border ring
        ctx.save();
        ctx.strokeStyle = "rgba(59,130,246,0.42)";
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, NODE_R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // icon
        ctx.save();
        drawIcon(ctx, nd.icon, nd.x, nd.y);
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", () => { resize(); nodes = null; packets.length = 0; liveConns.clear(); });
    raf = requestAnimationFrame(frame);

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}
