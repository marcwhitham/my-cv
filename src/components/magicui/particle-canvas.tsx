"use client";
import { useEffect, useRef } from "react";

// ─── types ────────────────────────────────────────────────────────────────────
type IconType   = "shield" | "lock" | "server" | "hub" | "eye" | "chip";
export type ObstacleRef = { current: HTMLElement | null };

interface Node {
  x: number; y: number; vx: number; vy: number;
  icon: IconType;
  a: number;           // alpha 0→1 fade-in
  pulseR: number; pulseA: number; nextPulse: number;
}
interface Packet { ai: number; bi: number; t: number; }

// ─── constants ────────────────────────────────────────────────────────────────
const NODE_R    = 15;
const MAX_DIST  = 220;
const PKT_SPEED = 0.0038;
const REPEL_R   = 72;     // nodes push apart below this distance
const REPEL_STR = 0.003;
const MAX_SPEED = 0.46;
const C_BLUE    = "#3b82f6";
const C_GLOW    = "rgba(59,130,246,0.30)";
const C_BRIGHT  = "rgba(147,197,253,0.92)";
const C_BG      = "rgba(12,19,34,0.52)";
const ICONS: IconType[] = ["shield","lock","server","hub","eye","chip","shield","lock","eye"];

// ─── icon drawing ─────────────────────────────────────────────────────────────
// Icons designed for a ±8 px box around (cx, cy). Caller sets globalAlpha.
function drawIcon(ctx: CanvasRenderingContext2D, icon: IconType, cx: number, cy: number) {
  ctx.strokeStyle = C_BLUE; ctx.fillStyle = C_BLUE;
  ctx.lineWidth = 1.4; ctx.lineCap = "round"; ctx.lineJoin = "round";
  switch (icon) {
    case "shield":
      ctx.beginPath();
      ctx.moveTo(cx, cy-7); ctx.lineTo(cx-5, cy-3.5); ctx.lineTo(cx-5, cy+1.5);
      ctx.quadraticCurveTo(cx, cy+8, cx, cy+8);
      ctx.quadraticCurveTo(cx, cy+8, cx+5, cy+1.5); ctx.lineTo(cx+5, cy-3.5);
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-2.5,cy+1); ctx.lineTo(cx-0.5,cy+3.5); ctx.lineTo(cx+3,cy-1.5); ctx.stroke();
      break;
    case "lock":
      ctx.beginPath(); ctx.arc(cx, cy-2.5, 3.5, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.rect(cx-4.5, cy-0.5, 9, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy+3, 1.5, 0, Math.PI*2); ctx.fill();
      break;
    case "server":
      ctx.beginPath(); ctx.rect(cx-5.5, cy-7, 11, 5); ctx.stroke();
      ctx.beginPath(); ctx.rect(cx-5.5, cy+0.5, 11, 5); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx-2.5, cy-4.5, 1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx-2.5, cy+3, 1, 0, Math.PI*2); ctx.fill();
      break;
    case "hub": {
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI*2); ctx.fill();
      for (let s = 0; s < 4; s++) {
        const a = (s/4)*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(cx+2.5*Math.cos(a), cy+2.5*Math.sin(a));
        ctx.lineTo(cx+6.2*Math.cos(a), cy+6.2*Math.sin(a)); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx+7*Math.cos(a), cy+7*Math.sin(a), 1.2, 0, Math.PI*2); ctx.fill();
      }
      break;
    }
    case "eye":
      ctx.beginPath();
      ctx.moveTo(cx-7, cy);
      ctx.bezierCurveTo(cx-3.5,cy-5, cx+3.5,cy-5, cx+7,cy);
      ctx.bezierCurveTo(cx+3.5,cy+5, cx-3.5,cy+5, cx-7,cy);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI*2); ctx.fill();
      break;
    case "chip":
      ctx.beginPath(); ctx.rect(cx-4.5, cy-4.5, 9, 9); ctx.stroke();
      for (let p = -1; p <= 1; p++) {
        ctx.beginPath(); ctx.moveTo(cx+p*3, cy-4.5); ctx.lineTo(cx+p*3, cy-7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+p*3, cy+4.5); ctx.lineTo(cx+p*3, cy+7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx-4.5, cy+p*3); ctx.lineTo(cx-7,   cy+p*3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+4.5, cy+p*3); ctx.lineTo(cx+7,   cy+p*3); ctx.stroke();
      }
      break;
  }
}

// ─── geometry helpers ─────────────────────────────────────────────────────────
// Convert viewport DOMRect to canvas-local coords with padding.
function toLocal(r: DOMRect, cr: DOMRect, pad: number) {
  return {
    l: r.left - cr.left - pad, t: r.top - cr.top - pad,
    ri: r.right - cr.left + pad, b: r.bottom - cr.top + pad,
  };
}

// Circle-vs-AABB: resolve penetration and reflect velocity.
function collideRect(nd: Node, r: DOMRect, cr: DOMRect) {
  const { l, t, ri, b } = toLocal(r, cr, 6);
  if (nd.x + NODE_R < l || nd.x - NODE_R > ri || nd.y + NODE_R < t || nd.y - NODE_R > b) return;

  const cx = Math.max(l, Math.min(nd.x, ri));
  const cy = Math.max(t, Math.min(nd.y, b));
  const dx = nd.x - cx, dy = nd.y - cy;
  const dSq = dx*dx + dy*dy;
  if (dSq >= NODE_R * NODE_R) return;

  if (dSq < 1e-6) {
    // centre inside rect — eject through nearest edge
    const [dl, dr, dt2, db] = [nd.x-l, ri-nd.x, nd.y-t, b-nd.y];
    const m = Math.min(dl, dr, dt2, db);
    if      (m === dl)  { nd.x = l-NODE_R;  nd.vx = -Math.abs(nd.vx); }
    else if (m === dr)  { nd.x = ri+NODE_R; nd.vx =  Math.abs(nd.vx); }
    else if (m === dt2) { nd.y = t-NODE_R;  nd.vy = -Math.abs(nd.vy); }
    else                { nd.y = b+NODE_R;  nd.vy =  Math.abs(nd.vy); }
    return;
  }

  const d = Math.sqrt(dSq), nx = dx/d, ny = dy/d;
  nd.x += nx*(NODE_R-d); nd.y += ny*(NODE_R-d);
  const dot = nd.vx*nx + nd.vy*ny;
  if (dot < 0) { nd.vx -= 2*dot*nx; nd.vy -= 2*dot*ny; }
}

// Liang-Barsky segment clip: returns true if segment passes through rect.
function segBlocked(x1: number, y1: number, x2: number, y2: number, r: DOMRect, cr: DOMRect): boolean {
  const { l, t, ri, b } = toLocal(r, cr, 2);
  const dx = x2-x1, dy = y2-y1;
  let t0 = 0, t1 = 1;
  const ps = [-dx, dx, -dy, dy];
  const qs = [x1-l, ri-x1, y1-t, b-y1];
  for (let i = 0; i < 4; i++) {
    const p = ps[i], q = qs[i];
    if (Math.abs(p) < 1e-10) { if (q < 0) return false; continue; }
    const ratio = q / p;
    if (p < 0) { if (ratio > t1) return false; if (ratio > t0) t0 = ratio; }
    else        { if (ratio < t0) return false; if (ratio < t1) t1 = ratio; }
  }
  return t0 <= t1;
}

// ─── component ────────────────────────────────────────────────────────────────
export function ParticleCanvas({ obstacles = [] }: { obstacles?: ObstacleRef[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let w = 0, h = 0, dpr = 1, raf = 0, frameN = 0;
    let nodes: Node[] | null = null;
    const packets: Packet[]  = [];
    const liveConns          = new Set<string>();

    // Obstacle rects cached and refreshed via ResizeObserver + dirty flag.
    // Stored as viewport DOMRects; canvas rect is always read fresh each frame
    // so canvas-local positions stay correct even when the page scrolls.
    let cachedRects: DOMRect[] = [];
    let rectsDirty = true;

    function refreshRects() {
      cachedRects = obstacles
        .map(ob => ob.current?.getBoundingClientRect())
        .filter((r): r is DOMRect => !!r);
      rectsDirty = false;
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rectsDirty = true;
    }

    function mkNode(icon: IconType): Node {
      const ang = Math.random() * Math.PI * 2, spd = 0.1 + Math.random() * 0.16;
      return {
        x: NODE_R + Math.random() * (w - NODE_R*2),
        y: NODE_R + Math.random() * (h - NODE_R*2),
        vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
        icon, a: 0,
        pulseR: 0, pulseA: 0,
        nextPulse: performance.now() + 800 + Math.random()*5000,
      };
    }

    function frame(now: number) {
      if (!nodes) nodes = ICONS.map(mkNode);
      frameN++;
      ctx.clearRect(0, 0, w, h);

      // Refresh cached rects when dirty; also every ~2 s as position fallback
      if (rectsDirty || frameN % 120 === 0) refreshRects();
      const cRect = canvas.getBoundingClientRect(); // always fresh

      // ── node-node repulsion ───────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const d = Math.hypot(dx, dy);
          if (d < REPEL_R && d > 0.001) {
            const f = REPEL_STR * (REPEL_R/d - 1);
            const fx = dx/d*f, fy = dy/d*f;
            nodes[i].vx -= fx; nodes[i].vy -= fy;
            nodes[j].vx += fx; nodes[j].vy += fy;
          }
        }
      }

      // ── integrate + wall bounce + obstacle collision ──────────────────────
      for (const nd of nodes) {
        nd.x += nd.vx; nd.y += nd.vy;

        // speed cap (prevents runaway after many repulsions)
        const spd = Math.hypot(nd.vx, nd.vy);
        if (spd > MAX_SPEED) { const inv = MAX_SPEED/spd; nd.vx *= inv; nd.vy *= inv; }

        // wall bounce
        if (nd.x < NODE_R+4)   { nd.x = NODE_R+4;   nd.vx =  Math.abs(nd.vx); }
        if (nd.x > w-NODE_R-4) { nd.x = w-NODE_R-4; nd.vx = -Math.abs(nd.vx); }
        if (nd.y < NODE_R+4)   { nd.y = NODE_R+4;   nd.vy =  Math.abs(nd.vy); }
        if (nd.y > h-NODE_R-4) { nd.y = h-NODE_R-4; nd.vy = -Math.abs(nd.vy); }

        // DOM obstacle collision (cached rects, fresh canvas origin)
        for (const r of cachedRects) collideRect(nd, r, cRect);

        // pulse ring trigger
        if (now >= nd.nextPulse) {
          nd.pulseR = NODE_R; nd.pulseA = 0.45;
          nd.nextPulse = now + 5000 + Math.random()*6000;
        }
        if (nd.pulseA > 0) { nd.pulseR += 0.5; nd.pulseA = Math.max(0, nd.pulseA - 0.006); }

        // fade in after spawn/respawn
        if (nd.a < 1) nd.a = Math.min(1, nd.a + 0.025);
      }

      // ── connections (culled if line passes through any obstacle) ──────────
      const newConns = new Set<string>();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const ni = nodes[i], nj = nodes[j];
          if (Math.hypot(nj.x-ni.x, nj.y-ni.y) >= MAX_DIST) continue;
          if (cachedRects.some(r => segBlocked(ni.x, ni.y, nj.x, nj.y, r, cRect))) continue;

          const key   = `${i}-${j}`;
          const dist  = Math.hypot(nj.x-ni.x, nj.y-ni.y);
          const alpha = (1 - dist/MAX_DIST) * 0.28 * Math.min(ni.a, nj.a);
          newConns.add(key);

          ctx.save();
          ctx.globalAlpha    = alpha;
          ctx.strokeStyle    = C_BLUE; ctx.lineWidth = 1;
          ctx.setLineDash([5,5]); ctx.lineDashOffset = -(now/40);
          ctx.beginPath(); ctx.moveTo(ni.x, ni.y); ctx.lineTo(nj.x, nj.y); ctx.stroke();
          ctx.restore();

          if (!liveConns.has(key) && !packets.some(p => p.ai===i && p.bi===j))
            packets.push({ ai:i, bi:j, t: Math.random() });
        }
      }

      // prune packets for dropped connections
      for (let p = packets.length-1; p >= 0; p--)
        if (!newConns.has(`${packets[p].ai}-${packets[p].bi}`)) packets.splice(p, 1);
      liveConns.clear(); newConns.forEach(k => liveConns.add(k));

      // ── packets ───────────────────────────────────────────────────────────
      for (const pkt of packets) {
        pkt.t = (pkt.t + PKT_SPEED) % 1;
        const ni = nodes[pkt.ai], nj = nodes[pkt.bi];
        ctx.save();
        ctx.globalAlpha = 0.92 * Math.min(ni.a, nj.a);
        ctx.shadowBlur = 8; ctx.shadowColor = C_BRIGHT; ctx.fillStyle = C_BRIGHT;
        ctx.beginPath();
        ctx.arc(ni.x + (nj.x-ni.x)*pkt.t, ni.y + (nj.y-ni.y)*pkt.t, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      // ── nodes ─────────────────────────────────────────────────────────────
      for (const nd of nodes) {
        if (nd.pulseA > 0) {
          ctx.save();
          ctx.globalAlpha = nd.pulseA * nd.a;
          ctx.strokeStyle = C_BLUE; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.pulseR, 0, Math.PI*2); ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = nd.a;
        ctx.shadowBlur = 14; ctx.shadowColor = C_GLOW;
        ctx.fillStyle = C_BG;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, NODE_R, 0, Math.PI*2); ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.42 * nd.a;
        ctx.strokeStyle = C_BLUE; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, NODE_R, 0, Math.PI*2); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.72 * nd.a;
        drawIcon(ctx, nd.icon, nd.x, nd.y);
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    }

    // ResizeObserver on obstacle elements: fires when terminal grows, columns resize, etc.
    const roObs = new ResizeObserver(() => { rectsDirty = true; });
    for (const ob of obstacles) { if (ob.current) roObs.observe(ob.current); }

    // ResizeObserver on canvas itself: fires when hero section height changes
    // (e.g. terminal growth expands the section). Updates w/h without respawning.
    const roCanvas = new ResizeObserver(() => resize());
    roCanvas.observe(canvas);

    // Window resize: respawn nodes with fresh positions + fade-in
    const onResize = () => {
      resize();
      nodes = null; packets.length = 0; liveConns.clear();
    };
    window.addEventListener("resize", onResize);

    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      roObs.disconnect();
      roCanvas.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 15 }}
    />
  );
}
