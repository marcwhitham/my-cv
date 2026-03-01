"use client";
import { useEffect, useRef } from "react";

// ─── types ────────────────────────────────────────────────────────────────────
type IconType = "shield" | "lock" | "server" | "hub" | "eye" | "chip";

/**
 * NodeRole distinguishes the two singleton "special agent" nodes from the
 * regular network nodes.  Only one hacker and one tracer exist at a time.
 */
type NodeRole = "normal" | "hacker" | "tracer";

export type ObstacleRef = { current: HTMLElement | null };

interface Node {
  x: number; y: number; vx: number; vy: number;
  icon: IconType; ip: string; a: number;
  pulseR: number; pulseA: number; nextPulse: number;
  status: string | null; statusBorn: number;
  dying: boolean;
  // ── special-agent extensions (safe defaults on normal nodes) ─────────────
  role: NodeRole;
  /** True once the hacker has successfully exfiltrated this node */
  infected: boolean;
  /** Timestamp of infection — seeds per-node glitch animation phase */
  infectedAt: number;
}

interface Packet {
  ai: number; bi: number; t: number;
  dir: 1 | -1;
  /** "hack" = malicious exploit packet the hacker sends during an attack */
  type: "syn" | "ack" | "data" | "hack";
  payload: string;
  dropAt: number;   // t-value where a data packet dies (> 1.0 = no drop)
  connKey: string;
}

interface Drop {
  x: number; y: number; a: number;
  p1r: number; p1a: number;
  p2r: number; p2a: number; p2started: boolean; p2t: number;
  born: number;
  /** Ring colour — C_RED for packet-loss drops, C_TRACE for kill explosions */
  color: string;
}

interface Msg {
  x: number; y: number;
  text: string; born: number; color: string;
}

// ─── constants ────────────────────────────────────────────────────────────────
const NODE_R    = 15;
const MAX_DIST  = 300;
const PKT_SPEED = 0.006;
const DROP_P    = 0.13;
const REPEL_R   = 72;
const REPEL_STR = 0.003;
const MAX_SPEED = 0.46;

// Normal network palette
const C_BLUE   = "#3b82f6";
const C_GLOW   = "rgba(59,130,246,0.30)";
const C_BRIGHT = "rgba(147,197,253,0.92)";
const C_BG     = "rgba(12,19,34,0.52)";
const C_GREEN  = "#10b981";
const C_RED    = "#ef4444";

// Hacker palette — hot red/magenta signals an active threat actor
const C_HACK      = "#ff2266";
const C_HACK_GLOW = "rgba(255,34,102,0.55)";
const C_HACK_BG   = "rgba(40,5,15,0.72)";

// Infected node overlay — red tint on compromised nodes
const C_INFECT_BORDER = "rgba(255,34,102,0.60)";

// Tracer (cyber-investigator) palette — amber/gold for authority
const C_TRACE      = "#f59e0b";
const C_TRACE_GLOW = "rgba(245,158,11,0.50)";
const C_TRACE_BG   = "rgba(30,20,5,0.72)";

const ICON_TYPES: IconType[] = ["shield","lock","server","hub","eye","chip"];
const ICONS: IconType[] = ["shield","lock","server","hub","eye","chip","shield","lock","eye"];
const PAYLOADS  = ["10110100","01101011","11001010","00110101","0xA3","0x4F","0xB2","0xE7","TTL:64","SEQ:8"];
const ERR_TEXTS = ["TIMEOUT","PKT LOSS","CONN RESET","RTX:3","NO ROUTE"];

/** Payload strings on hacker exploit packets — shell / kernel / web-exploit flavour */
const HACK_PKTS = ["0x41414141","EXEC:SH","ROOTKIT","PRIVESC","OVERFLOW","SQL_INJ","XSS:DOM","BACKDOOR"];

/** Rotating status labels shown on the tracer while it hunts the hacker */
const TRACE_STATUS = ["TRACING...","SIG LOCK","NARROWING","ON TARGET","CLOSING IN"];

const rn   = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]): T => a[0 | Math.random() * a.length];
const makeIP = () => `10.${0|rn(1,255)}.${0|rn(0,255)}.${0|rn(1,254)}`;

// ─── icon drawing ─────────────────────────────────────────────────────────────
/**
 * Draws one of the standard network node icons.
 * color defaults to C_BLUE so all existing call-sites are unchanged;
 * pass a different colour to tint infected-node glitch passes.
 */
function drawIcon(ctx: CanvasRenderingContext2D, icon: IconType, cx: number, cy: number, color = C_BLUE) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
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

/**
 * Bug (insect) icon for the hacker node.
 * A literal "software bug" makes the threat metaphor explicit in the visuals.
 * color is passed per-channel so chromatic-aberration glitch passes work correctly.
 */
function drawHackerIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  // Body oval
  ctx.beginPath(); ctx.ellipse(cx, cy+1, 4, 5.5, 0, 0, Math.PI*2); ctx.stroke();
  // Head
  ctx.beginPath(); ctx.arc(cx, cy-5.5, 2.8, 0, Math.PI*2); ctx.stroke();
  // Eyes — two small filled dots
  ctx.beginPath(); ctx.arc(cx-1.1, cy-5.5, 0.8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx+1.1, cy-5.5, 0.8, 0, Math.PI*2); ctx.fill();
  // Antennae
  ctx.beginPath(); ctx.moveTo(cx-1.3, cy-8.2); ctx.lineTo(cx-3.8, cy-11.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+1.3, cy-8.2); ctx.lineTo(cx+3.8, cy-11.5); ctx.stroke();
  // Body segmentation lines (thorax / abdomen)
  ctx.beginPath(); ctx.moveTo(cx-3.8, cy-1);   ctx.lineTo(cx+3.8, cy-1);   ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx-3.8, cy+2.5); ctx.lineTo(cx+3.8, cy+2.5); ctx.stroke();
  // Three pairs of legs
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(cx+s*4, cy-1);   ctx.lineTo(cx+s*7.5, cy-3);   ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+s*4, cy+1.5); ctx.lineTo(cx+s*7.5, cy+1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+s*4, cy+4);   ctx.lineTo(cx+s*7.5, cy+5.5); ctx.stroke();
  }
}

/**
 * Crosshair / targeting-reticle icon for the tracer node.
 * spin (radians) is driven by performance.now() so the outer arc segments
 * rotate slowly, giving the impression of active signal scanning / lock-on.
 */
function drawTracerIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, spin: number) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = 1.5; ctx.lineCap = "round";
  const R = 6.5, G = 3;
  // Outer rotating arc segments (four quadrants)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin);
  for (let q = 0; q < 4; q++) {
    const a = (q / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(0, 0, R, a + 0.35, a + Math.PI / 2 - 0.35);
    ctx.stroke();
  }
  ctx.restore();
  // Fixed inner cross-hair lines (gap in the centre)
  ctx.beginPath(); ctx.moveTo(cx-R-2.5, cy);  ctx.lineTo(cx-G, cy);      ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx+G,     cy);  ctx.lineTo(cx+R+2.5, cy);  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy-R-2.5); ctx.lineTo(cx, cy-G);       ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy+G);     ctx.lineTo(cx, cy+R+2.5);   ctx.stroke();
  // Centre pip
  ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI*2); ctx.fill();
}

/**
 * Chromatic-aberration glitch pass — the classic RGB-split "glitch" look.
 * Renders three passes via drawFn:
 *   1. Red channel, shifted left  (-offsetAmt)
 *   2. Cyan channel, shifted right (+offsetAmt)
 *   3. Real colour, centred        (0)
 *
 * @param offsetAmt  Horizontal pixel shift per channel (increase for more glitch)
 * @param color      The "real" foreground colour drawn on the centred pass
 * @param drawFn     Called as drawFn(channelColor, xOffset) for each of the 3 passes
 */
function glitchDraw(
  offsetAmt: number,
  color: string,
  drawFn: (col: string, ox: number) => void,
) {
  drawFn("rgba(255,0,80,0.55)",  -offsetAmt); // red channel, left
  drawFn("rgba(0,255,200,0.45)", +offsetAmt); // cyan channel, right
  drawFn(color, 0);                           // real colour, centred
}

// ─── geometry helpers ─────────────────────────────────────────────────────────
function toLocal(r: DOMRect, cr: DOMRect, pad: number) {
  return { l: r.left-cr.left-pad, t: r.top-cr.top-pad, ri: r.right-cr.left+pad, b: r.bottom-cr.top+pad };
}

function collideRect(nd: Node, r: DOMRect, cr: DOMRect) {
  const { l, t, ri, b } = toLocal(r, cr, 6);
  if (nd.x+NODE_R < l || nd.x-NODE_R > ri || nd.y+NODE_R < t || nd.y-NODE_R > b) return;
  const cx = Math.max(l, Math.min(nd.x, ri)), cy = Math.max(t, Math.min(nd.y, b));
  const dx = nd.x-cx, dy = nd.y-cy, dSq = dx*dx+dy*dy;
  if (dSq >= NODE_R*NODE_R) return;
  if (dSq < 1e-6) {
    const [dl,dr,dt2,db] = [nd.x-l,ri-nd.x,nd.y-t,b-nd.y], m = Math.min(dl,dr,dt2,db);
    if      (m===dl)  { nd.x=l-NODE_R;  nd.vx=-Math.abs(nd.vx); }
    else if (m===dr)  { nd.x=ri+NODE_R; nd.vx= Math.abs(nd.vx); }
    else if (m===dt2) { nd.y=t-NODE_R;  nd.vy=-Math.abs(nd.vy); }
    else              { nd.y=b+NODE_R;  nd.vy= Math.abs(nd.vy); }
    return;
  }
  const d=Math.sqrt(dSq), nx=dx/d, ny=dy/d;
  nd.x+=nx*(NODE_R-d); nd.y+=ny*(NODE_R-d);
  const dot=nd.vx*nx+nd.vy*ny;
  if (dot<0) { nd.vx-=2*dot*nx; nd.vy-=2*dot*ny; }
}

function segBlocked(x1: number, y1: number, x2: number, y2: number, r: DOMRect, cr: DOMRect): boolean {
  const {l,t,ri,b} = toLocal(r,cr,2);
  const dx=x2-x1, dy=y2-y1; let t0=0, t1=1;
  const ps=[-dx,dx,-dy,dy], qs=[x1-l,ri-x1,y1-t,b-y1];
  for (let i=0;i<4;i++) {
    const p=ps[i],q=qs[i];
    if (Math.abs(p)<1e-10) { if(q<0) return false; continue; }
    const ratio=q/p;
    if (p<0) { if(ratio>t1) return false; if(ratio>t0) t0=ratio; }
    else     { if(ratio<t0) return false; if(ratio<t1) t1=ratio; }
  }
  return t0<=t1;
}

// ─── component ────────────────────────────────────────────────────────────────
export function ParticleCanvas({ obstacles = [] }: { obstacles?: ObstacleRef[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasMaybe = canvasRef.current;
    if (!canvasMaybe) return;
    // Typed as non-nullable after the guard above — TypeScript doesn't narrow
    // across nested function declarations, so we reassign to a typed const.
    const canvas = canvasMaybe as HTMLCanvasElement;
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx = ctxMaybe as CanvasRenderingContext2D;

    let w=0, h=0, dpr=1, raf=0, frameN=0;
    let nodes: Node[] | null = null;

    const packets: Packet[] = [];
    const drops:   Drop[]   = [];
    const msgs:    Msg[]    = [];

    const liveConns = new Set<string>();
    const estConns  = new Set<string>();
    const cooldowns = new Map<string, number>();

    let cachedRects: DOMRect[] = [];
    let rectsDirty  = true;
    let nextMsgSpawn = 0;
    let nextCycle    = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // HACKER STATE MACHINE
    // The hacker is a singleton "threat actor" node that:
    //   1. Roams the network looking for uninfected nodes
    //   2. Launches a multi-second hack attack, sending exploit packets
    //   3. On success, marks the target as infected ("PWNED")
    //   4. Every TELE_EVERY infections it teleports to an empty area
    //   5. Once the tracer catches it the hacker is killed (dying = true)
    // ─────────────────────────────────────────────────────────────────────────
    type HackerPhase = "roaming" | "hacking" | "teleporting" | "dead";
    let hackerIdx:   number = -1;        // index into nodes[] (-1 = not spawned)
    let hackerPhase: HackerPhase = "roaming";
    let hackerTarget  = -1;              // index of the node currently under attack
    let hackStart     = 0;              // timestamp when current hack attempt began
    const HACK_DUR    = 3500;           // ms to complete one hack
    let nextHackCheck = 0;             // when to next scan for a suitable target
    let infectedCount = 0;             // running total of successfully hacked nodes
    /** Teleport is triggered once per TELE_EVERY successful infections */
    const TELE_EVERY  = 2;
    let teleportStart = 0;             // timestamp when the current teleport flash began
    const TELE_DUR    = 700;           // ms for full teleport flash → position-jump sequence
    let teleportDest: { x: number; y: number } | null = null;
    let teleportJumped = false;        // whether the position swap has occurred this cycle
    /** After a full hacker lifecycle (spawn → infect → caught → die), wait before respawning */
    let nextHackerSpawn = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // TRACER STATE MACHINE
    // The tracer is a singleton "cyber-investigator" node that:
    //   1. Spawns 3–5 s after the hacker infects its 2nd node
    //   2. Hunts the hacker by overriding its velocity each frame
    //   3. On closing within kill range, triggers a kill sequence
    //   4. Hacker dies first; tracer logs "TRACE COMPLETE" then also dies
    // The lifecycle mirrors a police investigator catching a criminal —
    // both the criminal and the investigation "end" after the arrest.
    // ─────────────────────────────────────────────────────────────────────────
    type TracerPhase = "dormant" | "hunting" | "killing" | "dead";
    let tracerIdx:   number = -1;
    let tracerPhase: TracerPhase = "dormant";
    let tracerSpawnAt    = 0;          // scheduled timestamp to spawn the tracer
    let killStart        = 0;          // timestamp when kill sequence began
    const KILL_DUR       = 1200;       // ms before the tracer marks itself as dying
    let tracerStatusTick = 0;         // when to next rotate the tracer's status label

    // ─── node factories ───────────────────────────────────────────────────────
    /** Creates a standard network node with safe defaults for special-agent fields */
    function mkNode(icon: IconType, ox?: number, oy?: number): Node {
      const ang = Math.random()*Math.PI*2, spd = 0.1+Math.random()*0.16;
      return {
        x: ox ?? NODE_R+Math.random()*(w-NODE_R*2),
        y: oy ?? NODE_R+Math.random()*(h-NODE_R*2),
        vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
        icon, ip: makeIP(), a: 0,
        pulseR: 0, pulseA: 0, nextPulse: performance.now()+800+Math.random()*5000,
        status: null, statusBorn: 0, dying: false,
        role: "normal", infected: false, infectedAt: 0,
      };
    }

    /**
     * Creates a special hacker or tracer node.
     * Uses a private IP range that visually differs from the normal 10.x.x.x nodes:
     *   hacker → 192.168.x.x  (LAN — the attacker hides inside the network)
     *   tracer → 172.16.x.x   (IANA reserved — reads as "authority" range)
     */
    function mkSpecialNode(role: "hacker" | "tracer", ox: number, oy: number): Node {
      const ang = Math.random()*Math.PI*2, spd = 0.12+Math.random()*0.10;
      const ip = role === "hacker"
        ? `192.168.${0|rn(1,254)}.${0|rn(1,254)}`
        : `172.16.${0|rn(1,254)}.${0|rn(1,254)}`;
      return {
        x: ox, y: oy, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
        // icon field is not used for special nodes — custom draw functions are called instead
        icon: "eye", ip, a: 0,
        pulseR: 0, pulseA: 0, nextPulse: 0,
        status: null, statusBorn: 0, dying: false,
        role, infected: false, infectedAt: 0,
      };
    }

    /** 40-sample furthest-point search — places new nodes in the emptiest area */
    function findEmptySpot(ns: Node[]): { x: number; y: number } {
      const alive = ns.filter(nd => !nd.dying);
      let bx=NODE_R*2+Math.random()*(w-NODE_R*4), by=NODE_R*2+Math.random()*(h-NODE_R*4), bd=0;
      for (let s=0; s<40; s++) {
        const cx=NODE_R*2+Math.random()*(w-NODE_R*4), cy=NODE_R*2+Math.random()*(h-NODE_R*4);
        let md=Infinity;
        for (const nd of alive) { const d=Math.hypot(nd.x-cx,nd.y-cy); if (d<md) md=d; }
        if (md>bd) { bd=md; bx=cx; by=cy; }
      }
      return { x: bx, y: by };
    }

    /**
     * Purges fully-faded dying nodes from the array and remaps every index
     * reference (packets, connection sets, cooldowns, hacker/tracer indices)
     * so no stale indices survive into the next frame.
     */
    function purgeDead(ns: Node[]): Node[] {
      const deadSet = new Set<number>();
      for (let i=0; i<ns.length; i++) { if (ns[i].dying && ns[i].a<=0) deadSet.add(i); }
      if (!deadSet.size) return ns;

      // Build old-index → new-index map before splicing
      const remap = new Map<number,number>();
      let ni=0;
      for (let i=0; i<ns.length; i++) { if (!deadSet.has(i)) remap.set(i,ni++); }

      // Remap special-agent indices — they must always track their node correctly
      if (hackerIdx >= 0) hackerIdx = deadSet.has(hackerIdx) ? -1 : (remap.get(hackerIdx) ?? -1);
      if (tracerIdx >= 0) tracerIdx = deadSet.has(tracerIdx) ? -1 : (remap.get(tracerIdx) ?? -1);

      // Purge and remap packets
      for (let p=packets.length-1; p>=0; p--) {
        const pk=packets[p];
        if (deadSet.has(pk.ai)||deadSet.has(pk.bi)) { packets.splice(p,1); continue; }
        pk.ai=remap.get(pk.ai)!; pk.bi=remap.get(pk.bi)!;
        pk.connKey=`${Math.min(pk.ai,pk.bi)}-${Math.max(pk.ai,pk.bi)}`;
      }

      const remapKey = (key: string) => {
        const [a,b]=key.split('-').map(Number);
        if (deadSet.has(a)||deadSet.has(b)) return null;
        const na=remap.get(a)!, nb=remap.get(b)!;
        return `${Math.min(na,nb)}-${Math.max(na,nb)}`;
      };
      const remapSet = (s: Set<string>) => {
        const s2=new Set<string>(); for (const k of s) { const nk=remapKey(k); if(nk) s2.add(nk); }
        s.clear(); s2.forEach(k=>s.add(k));
      };
      remapSet(liveConns); remapSet(estConns);

      const newCool=new Map<string,number>();
      for (const [k,v] of cooldowns) { const nk=remapKey(k); if(nk) newCool.set(nk,v); }
      cooldowns.clear(); newCool.forEach((v,k)=>cooldowns.set(k,v));

      return ns.filter((_,i)=>!deadSet.has(i));
    }

    function mkPkt(ai: number, bi: number, key: string, type: "syn"|"ack"|"data"|"hack"): Packet {
      const drop = type==="data" && Math.random()<DROP_P;
      return {
        ai, bi, t: 0, dir: 1, type,
        payload: type==="syn" ? "SYN"
               : type==="ack" ? "ACK"
               : type==="hack" ? pick(HACK_PKTS)
               : pick(PAYLOADS),
        dropAt: drop ? rn(0.25,0.75) : 1.1,
        connKey: key,
      };
    }

    // ─── main animation loop ──────────────────────────────────────────────────
    function frame(now: number) {
      if (!nodes) {
        nodes = ICONS.map(icon => mkNode(icon));
        nextMsgSpawn  = now + 4000 + Math.random()*4000;
        nextCycle     = now + 5000;
        // Give the network 4 s to settle before the hacker appears
        nextHackerSpawn = now + 4000;
      }
      frameN++;
      ctx.clearRect(0,0,w,h);

      if (rectsDirty || frameN%120===0) refreshRects();
      const cRect = canvas.getBoundingClientRect();

      // ── hacker first-spawn & respawn ────────────────────────────────────────
      // On initial spawn: hackerPhase is "roaming" and hackerIdx is -1.
      // On respawn (after full lifecycle): both phase and tracerPhase are "dead"
      // and both indices have been set to -1 by purgeDead.
      if (hackerIdx === -1 && hackerPhase !== "dead" && now >= nextHackerSpawn) {
        const pos = findEmptySpot(nodes);
        hackerIdx = nodes.length;
        nodes.push(mkSpecialNode("hacker", pos.x, pos.y));
        hackerPhase   = "roaming";
        nextHackCheck = now + 3000;  // 3 s grace period to render before attacking
      }

      // Full lifecycle complete — reset world and begin a new hacker cycle
      if (hackerPhase === "dead" && tracerPhase === "dead"
          && hackerIdx === -1 && tracerIdx === -1
          && now >= nextHackerSpawn) {
        for (const nd of nodes) { nd.infected = false; nd.infectedAt = 0; }
        infectedCount = 0;
        hackerPhase   = "roaming";
        tracerPhase   = "dormant";
        tracerSpawnAt = 0;
        nextHackerSpawn = now; // spawn immediately next frame
      }

      // ── hacker state machine ────────────────────────────────────────────────
      if (hackerIdx >= 0 && nodes[hackerIdx]) {
        const hk = nodes[hackerIdx];

        switch (hackerPhase) {

          // ROAMING: wander freely; scan for an uninfected target every few seconds
          case "roaming": {
            if (now >= nextHackCheck) {
              // Prefer the nearest non-infected, non-dying, normal node within range
              let bestIdx = -1, bestDist = MAX_DIST * 1.3;
              for (let i = 0; i < nodes.length; i++) {
                const nd = nodes[i];
                if (i === hackerIdx || nd.dying || nd.infected || nd.role !== "normal") continue;
                const d = Math.hypot(nd.x - hk.x, nd.y - hk.y);
                if (d < bestDist) { bestDist = d; bestIdx = i; }
              }
              if (bestIdx >= 0) {
                hackerTarget  = bestIdx;
                hackerPhase   = "hacking";
                hackStart     = now;
                hk.status     = "HACKING..."; hk.statusBorn = now;
              } else {
                // No suitable target nearby — wander and retry sooner
                nextHackCheck = now + 1500;
              }
            }
            break;
          }

          // HACKING: drift toward the target and emit exploit packets for HACK_DUR ms
          case "hacking": {
            if (hackerTarget >= 0 && nodes[hackerTarget]) {
              const tgt = nodes[hackerTarget];
              const dx = tgt.x - hk.x, dy = tgt.y - hk.y;
              const d  = Math.hypot(dx, dy);

              // Gentle steering force — hacker creeps closer but doesn't rush
              if (d > 55) {
                hk.vx += (dx / d) * 0.0018;
                hk.vy += (dy / d) * 0.0018;
              }

              // Emit a red exploit packet whenever none is in flight on this link
              const hackKey = `${Math.min(hackerIdx, hackerTarget)}-${Math.max(hackerIdx, hackerTarget)}`;
              const hasPkt = packets.some(p => p.connKey === hackKey && p.type === "hack");
              if (!hasPkt && d < MAX_DIST * 1.1) {
                const pkt = mkPkt(hackerIdx, hackerTarget, hackKey, "hack");
                pkt.dropAt = 1.1; // hack packets always reach their target
                packets.push(pkt);
              }
            }

            // Hack complete — infect the target
            if (now - hackStart >= HACK_DUR) {
              if (hackerTarget >= 0 && nodes[hackerTarget]) {
                const tgt = nodes[hackerTarget];
                tgt.infected   = true;
                tgt.infectedAt = now;
                tgt.status     = "INFECTED"; tgt.statusBorn = now;
                infectedCount++;
                msgs.push({ x: tgt.x, y: tgt.y - NODE_R - 20, text: "PWNED", born: now, color: C_HACK });
              }
              hackerTarget = -1;

              // Teleport every TELE_EVERY infections to evade the tracer
              if (infectedCount % TELE_EVERY === 0) {
                hackerPhase   = "teleporting";
                teleportStart = now;
                teleportDest  = findEmptySpot(nodes);
                teleportJumped = false;
                hk.status     = "JACKING OUT"; hk.statusBorn = now;
              } else {
                hackerPhase   = "roaming";
                nextHackCheck = now + 2000;
                hk.status     = null;
              }

              // Schedule tracer spawn once infection threshold is crossed
              if (infectedCount >= 2 && tracerPhase === "dormant" && tracerSpawnAt === 0) {
                tracerSpawnAt = now + rn(3000, 5000);
              }
            }
            break;
          }

          // TELEPORTING: triangle-wave flash → mid-flash position jump → fade out
          case "teleporting": {
            const elapsed = now - teleportStart;
            // Dampen velocity so the node freezes visually during the flash
            hk.vx *= 0.80; hk.vy *= 0.80;

            // Mid-flash: perform the actual position swap
            if (!teleportJumped && elapsed >= TELE_DUR * 0.5 && teleportDest) {
              hk.x = teleportDest.x;
              hk.y = teleportDest.y;
              hk.vx = rn(-0.15, 0.15);
              hk.vy = rn(-0.15, 0.15);
              teleportJumped = true;
            }

            if (elapsed >= TELE_DUR) {
              hackerPhase   = "roaming";
              nextHackCheck = now + 2500;
              hk.status     = null;
            }
            break;
          }

          case "dead": break;
        }
      }

      // ── tracer spawn ─────────────────────────────────────────────────────────
      // Spawns from the top-left corner — a dramatic entry from "HQ"
      if (tracerPhase === "dormant" && tracerSpawnAt > 0 && now >= tracerSpawnAt) {
        const ex = NODE_R * 3, ey = NODE_R * 3;
        tracerIdx = nodes.length;
        nodes.push(mkSpecialNode("tracer", ex, ey));
        tracerPhase      = "hunting";
        tracerStatusTick = now + 1200;
        msgs.push({ x: ex + 20, y: ey - 24, text: "TRACER DEPLOYED", born: now, color: C_TRACE });
      }

      // ── tracer state machine ─────────────────────────────────────────────────
      if (tracerIdx >= 0 && nodes[tracerIdx]) {
        const tr = nodes[tracerIdx];

        switch (tracerPhase) {

          // HUNTING: steer aggressively toward the hacker and cycle status labels
          case "hunting": {
            if (hackerIdx >= 0 && nodes[hackerIdx]) {
              const hk = nodes[hackerIdx];
              const dx = hk.x - tr.x, dy = hk.y - tr.y, d = Math.hypot(dx, dy);

              // Stronger steering than normal repulsion — tracer is in pursuit
              if (d > 0.5) {
                tr.vx += (dx / d) * 0.0045;
                tr.vy += (dy / d) * 0.0045;
              }

              // Cycle through status messages for dramatic effect
              if (now >= tracerStatusTick) {
                tr.status = pick(TRACE_STATUS); tr.statusBorn = now;
                tracerStatusTick = now + rn(1000, 2200);
              }

              // Close enough — escalate to kill phase
              if (d < NODE_R * 3.8) {
                tracerPhase   = "killing";
                killStart     = now;
                tr.status     = "LOCKED ON"; tr.statusBorn = now;
                msgs.push({ x: tr.x, y: tr.y - NODE_R - 24, text: "SIGNAL TRACED", born: now, color: C_TRACE });
              }
            }
            break;
          }

          // KILLING: final approach → terminate hacker → tracer self-terminates
          case "killing": {
            const elapsed = now - killStart;

            // Continue chasing at sprint speed during the kill sequence
            if (hackerIdx >= 0 && nodes[hackerIdx]) {
              const hk = nodes[hackerIdx];
              const dx = hk.x - tr.x, dy = hk.y - tr.y, d = Math.hypot(dx, dy);
              if (d > 2) { tr.vx += (dx / d) * 0.009; tr.vy += (dy / d) * 0.009; }
            }

            // Execute: mark hacker as dying and emit kill effects
            if (elapsed >= KILL_DUR * 0.55 && hackerIdx >= 0 && nodes[hackerIdx] && !nodes[hackerIdx].dying) {
              const hk = nodes[hackerIdx];
              hk.dying = true;
              hackerPhase = "dead";
              // Amber explosion ring at point of arrest
              drops.push({
                x: hk.x, y: hk.y, a: 1,
                p1r: NODE_R, p1a: 0.85,
                p2r: NODE_R, p2a: 0, p2started: false, p2t: now + 250,
                born: now, color: C_TRACE,
              });
              msgs.push({ x: hk.x, y: hk.y - NODE_R - 24, text: "NEUTRALISED", born: now, color: C_TRACE });
            }

            // Tracer also terminates — the investigation closes with the case
            if (elapsed >= KILL_DUR && !tr.dying) {
              tr.dying      = true;
              tr.status     = "TRACE COMPLETE"; tr.statusBorn = now;
              tracerPhase   = "dead";
              // Schedule next hacker cycle 18–25 s later
              nextHackerSpawn = now + rn(18000, 25000);
            }
            break;
          }

          case "dormant": break;
          case "dead":    break;
        }
      }

      // ── normal node lifecycle (spawn 1, queue 1 to die, every 5 s) ──────────
      // Special agent nodes (hacker / tracer) are excluded from this cycling —
      // their lifecycle is managed entirely by their own state machines above.
      if (now >= nextCycle) {
        const alive = nodes
          .map((_nd,i)=>i)
          .filter(i => !nodes![i].dying && nodes![i].role === "normal");
        if (alive.length > 1) {
          nodes[alive[0|Math.random()*alive.length]].dying = true;
          const pos = findEmptySpot(nodes);
          nodes.push(mkNode(pick(ICON_TYPES), pos.x, pos.y));
        }
        nextCycle = now + 5000;
      }

      // ── repulsion (all non-dying nodes, including special agents) ────────────
      for (let i=0; i<nodes.length; i++) {
        for (let j=i+1; j<nodes.length; j++) {
          if (nodes[i].dying || nodes[j].dying) continue;
          const dx=nodes[j].x-nodes[i].x, dy=nodes[j].y-nodes[i].y, d=Math.hypot(dx,dy);
          if (d<REPEL_R && d>0.001) {
            const f=REPEL_STR*(REPEL_R/d-1), fx=dx/d*f, fy=dy/d*f;
            nodes[i].vx-=fx; nodes[i].vy-=fy; nodes[j].vx+=fx; nodes[j].vy+=fy;
          }
        }
      }

      // ── integrate + bounce + obstacle collision + pulse decay + alpha ─────────
      for (const nd of nodes) {
        nd.x+=nd.vx; nd.y+=nd.vy;
        const spd=Math.hypot(nd.vx,nd.vy);
        if (spd>MAX_SPEED) { const inv=MAX_SPEED/spd; nd.vx*=inv; nd.vy*=inv; }
        if (nd.x<NODE_R+4)   { nd.x=NODE_R+4;   nd.vx= Math.abs(nd.vx); }
        if (nd.x>w-NODE_R-4) { nd.x=w-NODE_R-4; nd.vx=-Math.abs(nd.vx); }
        if (nd.y<NODE_R+4)   { nd.y=NODE_R+4;   nd.vy= Math.abs(nd.vy); }
        if (nd.y>h-NODE_R-4) { nd.y=h-NODE_R-4; nd.vy=-Math.abs(nd.vy); }
        for (const r of cachedRects) collideRect(nd,r,cRect);
        if (!nd.dying && now>=nd.nextPulse) {
          nd.pulseR=NODE_R; nd.pulseA=0.45;
          nd.nextPulse=now+5000+Math.random()*6000;
        }
        if (nd.pulseA>0) { nd.pulseR+=0.5; nd.pulseA=Math.max(0,nd.pulseA-0.006); }
        if (nd.dying) { nd.a=Math.max(0,nd.a-0.02); }
        else if (nd.a<1) { nd.a=Math.min(1,nd.a+0.025); }
      }

      // ── connections (normal nodes only; special agents have their own links) ──
      const newConns      = new Set<string>();
      const connectedNodes = new Set<number>();
      for (let i=0; i<nodes.length; i++) {
        for (let j=i+1; j<nodes.length; j++) {
          const ni=nodes[i], nj=nodes[j];
          if (ni.dying || nj.dying) continue;
          // Special agent nodes don't participate in the standard handshake mesh
          if (ni.role !== "normal" || nj.role !== "normal") continue;
          const dist=Math.hypot(nj.x-ni.x,nj.y-ni.y);
          if (dist>=MAX_DIST) continue;
          if (cachedRects.some(r=>segBlocked(ni.x,ni.y,nj.x,nj.y,r,cRect))) continue;
          const key=`${i}-${j}`;
          newConns.add(key);
          connectedNodes.add(i); connectedNodes.add(j);
          // Connections between infected nodes glow red — the compromise spreads visually
          const lineColor = (ni.infected || nj.infected) ? C_INFECT_BORDER : C_BLUE;
          const alpha=(1-dist/MAX_DIST)*0.28*Math.min(ni.a,nj.a);
          ctx.save();
          ctx.globalAlpha=alpha; ctx.strokeStyle=lineColor; ctx.lineWidth=1;
          ctx.setLineDash([5,5]); ctx.lineDashOffset=-(now/40);
          ctx.beginPath(); ctx.moveTo(ni.x,ni.y); ctx.lineTo(nj.x,nj.y); ctx.stroke();
          ctx.restore();
        }
      }

      // ── prune dropped connections ─────────────────────────────────────────────
      for (const key of liveConns) {
        if (!newConns.has(key)) { estConns.delete(key); cooldowns.delete(key); }
      }
      // Keep hack packets alive even if the connection key left newConns
      for (let p=packets.length-1; p>=0; p--) {
        if (packets[p].type !== "hack" && !newConns.has(packets[p].connKey)) packets.splice(p,1);
      }

      // ── spawn normal packets ──────────────────────────────────────────────────
      for (const key of newConns) {
        if (packets.some(p=>p.connKey===key)) continue;
        const [ai,bi]=key.split('-').map(Number);
        if (estConns.has(key)) {
          if (!cooldowns.has(key) || now>=cooldowns.get(key)!) {
            packets.push(mkPkt(ai,bi,key,"data"));
            nodes[ai].pulseR=NODE_R; nodes[ai].pulseA=0.5;
            cooldowns.delete(key);
          }
        } else {
          packets.push(mkPkt(ai,bi,key,"syn"));
          nodes[ai].pulseR=NODE_R; nodes[ai].pulseA=0.5;
        }
      }
      liveConns.clear(); newConns.forEach(k=>liveConns.add(k));

      // ── update + draw packets ─────────────────────────────────────────────────
      for (let p=packets.length-1; p>=0; p--) {
        const pkt=packets[p];
        // Hack packets travel ~60 % faster — the exploit hits quickly
        pkt.t += pkt.type === "hack" ? PKT_SPEED * 1.6 : PKT_SPEED;

        const ni=nodes[pkt.ai], nj=nodes[pkt.bi];
        if (!ni || !nj) { packets.splice(p,1); continue; }

        const sx=pkt.dir===1?ni.x:nj.x, sy=pkt.dir===1?ni.y:nj.y;
        const ex=pkt.dir===1?nj.x:ni.x, ey=pkt.dir===1?nj.y:ni.y;

        // Packet drop (data only — hack packets never drop)
        if (pkt.type==="data" && pkt.t>=pkt.dropAt) {
          const dt=pkt.dropAt;
          const dpx=sx+(ex-sx)*dt, dpy=sy+(ey-sy)*dt;
          drops.push({ x:dpx,y:dpy,a:1, p1r:NODE_R,p1a:0.6, p2r:NODE_R,p2a:0,p2started:false,p2t:now+350, born:now, color:C_RED });
          if (Math.random()<0.5) msgs.push({ x:sx+rn(-20,20),y:sy-rn(16,28),text:pick(ERR_TEXTS),born:now,color:C_RED });
          cooldowns.set(pkt.connKey, now+rn(600,1400));
          packets.splice(p,1); continue;
        }

        // Arrival logic
        if (pkt.t>=1) {
          if (pkt.type==="syn") {
            nodes[pkt.bi].pulseR=NODE_R; nodes[pkt.bi].pulseA=0.5;
            pkt.type="ack"; pkt.payload="ACK"; pkt.dir=-1; pkt.t=0;
          } else if (pkt.type==="ack") {
            nodes[pkt.ai].pulseR=NODE_R; nodes[pkt.ai].pulseA=0.5;
            estConns.add(pkt.connKey);
            nodes[pkt.ai].status="LINK UP"; nodes[pkt.ai].statusBorn=now;
            cooldowns.set(pkt.connKey,now+rn(100,400));
            packets.splice(p,1);
          } else if (pkt.type==="hack") {
            // Exploit arrived — pulse the victim; infection is handled by the state machine
            nodes[pkt.bi].pulseR=NODE_R; nodes[pkt.bi].pulseA=0.65;
            packets.splice(p,1);
          } else {
            nodes[pkt.bi].pulseR=NODE_R; nodes[pkt.bi].pulseA=0.5;
            cooldowns.set(pkt.connKey,now+rn(200,900));
            packets.splice(p,1);
          }
          continue;
        }

        // Draw in-flight packet dot
        const px=sx+(ex-sx)*pkt.t, py=sy+(ey-sy)*pkt.t;
        const pAlpha=0.92*Math.min(ni.a,nj.a);
        const isHackPkt = pkt.type==="hack";
        const dotColor = isHackPkt ? C_HACK : (pkt.type==="ack" ? C_GREEN : C_BRIGHT);

        ctx.save();
        ctx.globalAlpha=pAlpha;
        ctx.shadowBlur=isHackPkt ? 14 : 8; ctx.shadowColor=dotColor; ctx.fillStyle=dotColor;
        ctx.beginPath(); ctx.arc(px,py,isHackPkt?4:pkt.type==="data"?3:3.5,0,Math.PI*2); ctx.fill();
        ctx.restore();

        // Hack packets render a dashed red strike-line so the attack vector is obvious
        if (isHackPkt) {
          ctx.save();
          ctx.globalAlpha=0.20*pAlpha;
          ctx.strokeStyle=C_HACK; ctx.lineWidth=1.5;
          ctx.setLineDash([3,6]); ctx.lineDashOffset=-(now/28);
          ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ex,ey); ctx.stroke();
          ctx.restore();
        }

        // Payload label
        ctx.save();
        ctx.globalAlpha=pAlpha*0.8;
        ctx.fillStyle=dotColor;
        ctx.font="bold 7px 'Courier New',monospace";
        ctx.textAlign="center";
        ctx.fillText(pkt.payload,px,py-9);
        ctx.restore();
      }

      // ── drop markers (packet-loss X + kill explosion rings) ──────────────────
      for (let m=drops.length-1; m>=0; m--) {
        const dm=drops[m];
        const age=now-dm.born;
        if (age>1200) { drops.splice(m,1); continue; }
        if (age>900) dm.a=Math.max(0,1-(age-900)/300);
        if (dm.p1a>0) { dm.p1r+=0.7; dm.p1a=Math.max(0,dm.p1a-0.012); }
        if (now>=dm.p2t && !dm.p2started) { dm.p2a=0.55; dm.p2started=true; }
        if (dm.p2a>0) { dm.p2r+=0.7; dm.p2a=Math.max(0,dm.p2a-0.012); }
        for (const [pr,pa] of [[dm.p1r,dm.p1a],[dm.p2r,dm.p2a]] as [number,number][]) {
          if (pa<=0) continue;
          ctx.save(); ctx.globalAlpha=pa*dm.a;
          ctx.strokeStyle=dm.color; ctx.lineWidth=1.5; ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(dm.x,dm.y,pr,0,Math.PI*2); ctx.stroke();
          ctx.restore();
        }
        // Red X for packet drops (kill explosions show rings only — no X)
        if (dm.color === C_RED) {
          ctx.save(); ctx.globalAlpha=dm.a;
          ctx.strokeStyle=C_RED; ctx.lineWidth=2; ctx.lineCap="round"; ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(dm.x-5,dm.y-5); ctx.lineTo(dm.x+5,dm.y+5);
          ctx.moveTo(dm.x+5,dm.y-5); ctx.lineTo(dm.x-5,dm.y+5);
          ctx.stroke(); ctx.restore();
        }
      }

      // ── ambient error messages (plus hacker/tracer msgs added elsewhere) ──────
      if (now>=nextMsgSpawn && nodes) {
        const normals = nodes.filter(nd=>nd.role==="normal" && !nd.dying);
        if (normals.length) {
          const nd=pick(normals);
          msgs.push({ x:nd.x+rn(12,28),y:nd.y-rn(14,28),text:pick(ERR_TEXTS),born:now,color:C_RED });
        }
        nextMsgSpawn=now+rn(9000,16000);
      }
      for (let e=msgs.length-1; e>=0; e--) {
        const em=msgs[e], age=now-em.born;
        if (age>1700) { msgs.splice(e,1); continue; }
        const a = age<300 ? age/300 : age<1200 ? 1 : 1-(age-1200)/500;
        ctx.save(); ctx.globalAlpha=a*0.88;
        ctx.fillStyle=em.color;
        ctx.font="bold 7.5px 'Courier New',monospace";
        ctx.textAlign="left";
        ctx.fillText(em.text,em.x,em.y);
        ctx.restore();
      }

      // ── node render loop ──────────────────────────────────────────────────────
      for (let ndIdx = 0; ndIdx < nodes.length; ndIdx++) {
        const nd = nodes[ndIdx];
        const isHacker  = ndIdx === hackerIdx;
        const isTracer  = ndIdx === tracerIdx;
        const isSpecial = isHacker || isTracer;

        // Theme colours per role
        const nodeColor = isHacker ? C_HACK  : isTracer ? C_TRACE  : C_BLUE;
        const nodeGlow  = isHacker ? C_HACK_GLOW : isTracer ? C_TRACE_GLOW : C_GLOW;
        const nodeBG    = isHacker ? C_HACK_BG   : isTracer ? C_TRACE_BG   : C_BG;

        // ── teleport flash (hacker only) ────────────────────────────────────
        // Triangle-wave flash: ramps up to 1.0 at mid-point, then back to 0.
        // Scanline strips and a white core give a "jack-out" cyberpunk look.
        if (isHacker && hackerPhase === "teleporting") {
          const elapsed = now - teleportStart;
          const flashA  = elapsed < TELE_DUR * 0.5
            ? elapsed / (TELE_DUR * 0.5)
            : 1 - (elapsed - TELE_DUR * 0.5) / (TELE_DUR * 0.5);

          // Horizontal glitch scanlines drawn on odd frames for a flicker effect
          if (flashA > 0.25 && frameN % 2 === 0) {
            ctx.save();
            ctx.globalAlpha = flashA * 0.40;
            ctx.fillStyle   = C_HACK;
            for (let strip = 0; strip < 6; strip++) {
              const sy2 = nd.y - NODE_R + Math.random() * NODE_R * 2.2;
              const sw  = 3 + Math.random() * 14;
              ctx.fillRect(nd.x - sw / 2, sy2, sw, 1.5);
            }
            ctx.restore();
          }
          // White core at the intensity peak
          ctx.save();
          ctx.globalAlpha  = Math.pow(flashA, 1.8) * nd.a;
          ctx.fillStyle    = "#ffffff";
          ctx.shadowBlur   = 28 * flashA; ctx.shadowColor = C_HACK;
          ctx.beginPath(); ctx.arc(nd.x, nd.y, NODE_R * (0.5 + flashA * 1.3), 0, Math.PI*2); ctx.fill();
          ctx.restore();
        }

        // ── pulse ring ───────────────────────────────────────────────────────
        if (nd.pulseA>0) {
          ctx.save(); ctx.globalAlpha=nd.pulseA*nd.a;
          ctx.strokeStyle=nodeColor; ctx.lineWidth=1; ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(nd.x,nd.y,nd.pulseR,0,Math.PI*2); ctx.stroke();
          ctx.restore();
        }

        // ── infected node: pulsing red quarantine ring ───────────────────────
        // The sine-wave opacity makes it breathe, giving a sense of "live" malware.
        if (nd.infected && !isSpecial) {
          const infPulse = 0.22 + 0.20 * Math.sin(now / 380);
          ctx.save(); ctx.globalAlpha = infPulse * nd.a;
          ctx.strokeStyle = C_HACK; ctx.lineWidth = 1.8;
          ctx.setLineDash([3,3]); ctx.lineDashOffset = -(now / 35);
          ctx.beginPath(); ctx.arc(nd.x, nd.y, NODE_R + 5, 0, Math.PI*2); ctx.stroke();
          ctx.restore();
        }

        // ── glow + fill ──────────────────────────────────────────────────────
        ctx.save(); ctx.globalAlpha=nd.a;
        ctx.shadowBlur=isSpecial ? 24 : 14; ctx.shadowColor=nodeGlow; ctx.fillStyle=nodeBG;
        ctx.beginPath(); ctx.arc(nd.x,nd.y,NODE_R,0,Math.PI*2); ctx.fill();
        ctx.restore();

        // ── border (hacker gets a dashed border — feels unstable / illegitimate) ─
        ctx.save(); ctx.globalAlpha=(isSpecial ? 0.78 : 0.42)*nd.a;
        ctx.strokeStyle=nodeColor; ctx.lineWidth=isSpecial ? 1.5 : 1;
        if (isHacker) ctx.setLineDash([3,3]); else ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(nd.x,nd.y,NODE_R,0,Math.PI*2); ctx.stroke();
        ctx.restore();

        // ── icon ─────────────────────────────────────────────────────────────
        ctx.save(); ctx.globalAlpha=0.72*nd.a;
        if (isHacker) {
          // Glitch intensity increases while actively attacking — idle is subtle
          const baseAmt   = 0.5 + 0.35 * Math.sin(now / 320);
          const attackAmt = 1.5 + 1.2  * Math.sin(now / 110);
          const glitchAmt = hackerPhase === "hacking" ? attackAmt : baseAmt;
          glitchDraw(glitchAmt, C_HACK, (col, ox) => drawHackerIcon(ctx, nd.x + ox, nd.y, col));

        } else if (isTracer) {
          // Slow clockwise spin on the outer arc segments — active scan / lock-on
          const spin = now / 1800;
          drawTracerIcon(ctx, nd.x, nd.y, C_TRACE, spin);

        } else if (nd.infected) {
          // Infected nodes get a subtle red RGB-split on their icon
          const glitchAmt = (0.6 + 0.4 * Math.sin(now / 190 + nd.infectedAt * 0.001)) * 0.5;
          glitchDraw(glitchAmt, C_HACK, (col, ox) => drawIcon(ctx, nd.icon, nd.x + ox, nd.y, col));

        } else {
          drawIcon(ctx, nd.icon, nd.x, nd.y);
        }
        ctx.restore();

        // ── IP label ─────────────────────────────────────────────────────────
        ctx.save(); ctx.globalAlpha=0.38*nd.a;
        ctx.fillStyle=nodeColor;
        ctx.font="8px 'Courier New',monospace";
        ctx.textAlign="center"; ctx.setLineDash([]);
        ctx.fillText(nd.ip,nd.x,nd.y+NODE_R+11);
        ctx.restore();

        // ── tracer → hacker signal-trace line ────────────────────────────────
        // A faint, animated dashed line from the tracer to the hacker's position
        // shows the investigator's tracking signal narrowing in.
        if (isTracer && tracerPhase === "hunting" && hackerIdx >= 0 && nodes[hackerIdx]) {
          const hk    = nodes[hackerIdx];
          const tdist = Math.hypot(hk.x - nd.x, hk.y - nd.y);
          if (tdist < MAX_DIST * 1.4) {
            const lineA = 0.10 + 0.08 * Math.sin(now / 280);
            ctx.save();
            ctx.globalAlpha = lineA * nd.a;
            ctx.strokeStyle = C_TRACE; ctx.lineWidth = 1;
            ctx.setLineDash([4,8]); ctx.lineDashOffset = -(now / 22);
            ctx.beginPath(); ctx.moveTo(nd.x, nd.y); ctx.lineTo(hk.x, hk.y); ctx.stroke();
            ctx.restore();
          }
        }

        // ── above-node status label ──────────────────────────────────────────
        if (nd.status) {
          const age = now - nd.statusBorn;
          // Normal nodes auto-clear their status after 2.2 s;
          // special-agent status is managed by their state machines.
          if (age > 2200 && nd.role === "normal") {
            nd.status = null;
          } else {
            const a = age<300 ? age/300 : age<1700 ? 1 : 1-(age-1700)/500;
            const labelColor = isHacker ? C_HACK
                             : isTracer ? C_TRACE
                             : nd.infected ? C_HACK
                             : C_GREEN;
            ctx.save(); ctx.globalAlpha=a*nd.a;
            ctx.fillStyle=labelColor;
            ctx.font="bold 7.5px 'Courier New',monospace";
            ctx.textAlign="center"; ctx.setLineDash([]);
            ctx.fillText(nd.status,nd.x,nd.y-NODE_R-8);
            ctx.restore();
          }
        } else if (!connectedNodes.has(ndIdx) && nd.a>0.5 && !nd.dying && nd.role==="normal") {
          // Isolated normal node — no nearby peers — show blinking "searching..."
          const blink = Math.sin(now/600)>0;
          ctx.save(); ctx.globalAlpha=(blink?0.55:0.3)*nd.a;
          ctx.fillStyle="rgba(148,163,184,0.9)";
          ctx.font="7px 'Courier New',monospace";
          ctx.textAlign="center"; ctx.setLineDash([]);
          ctx.fillText("searching...",nd.x,nd.y-NODE_R-8);
          ctx.restore();
        }
      }

      // ── purge fully-faded dying nodes + remap all index references ────────────
      nodes = purgeDead(nodes);

      raf = requestAnimationFrame(frame);
    }

    // ─── setup ────────────────────────────────────────────────────────────────
    function refreshRects() {
      cachedRects = obstacles.map(ob => ob.current?.getBoundingClientRect()).filter((r): r is DOMRect => !!r);
      rectsDirty  = false;
    }

    function resize() {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width  = Math.round(w*dpr);
      canvas.height = Math.round(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      rectsDirty = true;
    }

    const roObs = new ResizeObserver(()=>{ rectsDirty=true; });
    for (const ob of obstacles) { if (ob.current) roObs.observe(ob.current); }

    const roCanvas = new ResizeObserver(()=>resize());
    roCanvas.observe(canvas);

    const onResize = () => {
      resize();
      nodes=null; packets.length=0; drops.length=0; msgs.length=0;
      liveConns.clear(); estConns.clear(); cooldowns.clear();
      nextCycle=0;
    };
    window.addEventListener("resize", onResize);

    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      roObs.disconnect(); roCanvas.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:15 }}
    />
  );
}
