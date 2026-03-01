"use client";
import { useEffect, useRef } from "react";

// ─── types ───────────────────────────────────────────────────────────────────
type IconType = "shield" | "lock" | "server" | "hub" | "eye" | "chip";
export type ObstacleRef = { current: HTMLElement | null };

interface Node {
  x: number; y: number; vx: number; vy: number;
  icon: IconType; ip: string; a: number;
  pulseR: number; pulseA: number; nextPulse: number;
  status: string | null; statusBorn: number;
}
interface Packet {
  ai: number; bi: number; t: number;
  dir: 1 | -1;
  type: "syn" | "ack" | "data";
  payload: string;
  dropAt: number;   // t where packet dies (>1 = no drop)
  connKey: string;
}
interface Drop {
  x: number; y: number; a: number;
  p1r: number; p1a: number;
  p2r: number; p2a: number; p2started: boolean; p2t: number;
  born: number;
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

const C_BLUE   = "#3b82f6";
const C_GLOW   = "rgba(59,130,246,0.30)";
const C_BRIGHT = "rgba(147,197,253,0.92)";
const C_BG     = "rgba(12,19,34,0.52)";
const C_GREEN  = "#10b981";
const C_RED    = "#ef4444";

const ICONS: IconType[] = ["shield","lock","server","hub","eye","chip","shield","lock","eye"];
const PAYLOADS = ["10110100","01101011","11001010","00110101","0xA3","0x4F","0xB2","0xE7","TTL:64","SEQ:8"];
const ERR_TEXTS = ["TIMEOUT","PKT LOSS","CONN RESET","RTX:3","NO ROUTE"];

const rn   = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]): T => a[0 | Math.random() * a.length];
const makeIP = () => `10.${0|rn(1,255)}.${0|rn(0,255)}.${0|rn(1,254)}`;

// ─── icon drawing ─────────────────────────────────────────────────────────────
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
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let w=0, h=0, dpr=1, raf=0, frameN=0;
    let nodes: Node[] | null = null;

    const packets: Packet[]  = [];
    const drops:   Drop[]    = [];
    const msgs:    Msg[]     = [];

    const liveConns = new Set<string>();
    const estConns  = new Set<string>();
    const cooldowns = new Map<string, number>();

    let cachedRects: DOMRect[] = [];
    let rectsDirty  = true;
    let nextMsgSpawn = 0;

    function refreshRects() {
      cachedRects = obstacles.map(ob => ob.current?.getBoundingClientRect()).filter((r): r is DOMRect => !!r);
      rectsDirty = false;
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

    function mkNode(icon: IconType): Node {
      const ang = Math.random()*Math.PI*2, spd = 0.1+Math.random()*0.16;
      return {
        x: NODE_R+Math.random()*(w-NODE_R*2), y: NODE_R+Math.random()*(h-NODE_R*2),
        vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
        icon, ip: makeIP(), a: 0,
        pulseR: 0, pulseA: 0, nextPulse: performance.now()+800+Math.random()*5000,
        status: null, statusBorn: 0,
      };
    }

    function mkPkt(ai: number, bi: number, key: string, type: "syn"|"ack"|"data"): Packet {
      const drop = type==="data" && Math.random()<DROP_P;
      return {
        ai, bi, t: 0, dir: 1, type,
        payload: type==="syn" ? "SYN" : type==="ack" ? "ACK" : pick(PAYLOADS),
        dropAt: drop ? rn(0.25,0.75) : 1.1,
        connKey: key,
      };
    }

    function frame(now: number) {
      if (!nodes) {
        nodes = ICONS.map(mkNode);
        nextMsgSpawn = now + 4000 + Math.random()*4000;
      }
      frameN++;
      ctx.clearRect(0,0,w,h);

      if (rectsDirty || frameN%120===0) refreshRects();
      const cRect = canvas.getBoundingClientRect();

      // ── repulsion ───────────────────────────────────────────────────────────
      for (let i=0; i<nodes.length; i++) {
        for (let j=i+1; j<nodes.length; j++) {
          const dx=nodes[j].x-nodes[i].x, dy=nodes[j].y-nodes[i].y, d=Math.hypot(dx,dy);
          if (d<REPEL_R && d>0.001) {
            const f=REPEL_STR*(REPEL_R/d-1), fx=dx/d*f, fy=dy/d*f;
            nodes[i].vx-=fx; nodes[i].vy-=fy; nodes[j].vx+=fx; nodes[j].vy+=fy;
          }
        }
      }

      // ── integrate + bounce + collision + pulses + fade ──────────────────────
      for (const nd of nodes) {
        nd.x+=nd.vx; nd.y+=nd.vy;
        const spd=Math.hypot(nd.vx,nd.vy);
        if (spd>MAX_SPEED) { const inv=MAX_SPEED/spd; nd.vx*=inv; nd.vy*=inv; }
        if (nd.x<NODE_R+4)   { nd.x=NODE_R+4;   nd.vx= Math.abs(nd.vx); }
        if (nd.x>w-NODE_R-4) { nd.x=w-NODE_R-4; nd.vx=-Math.abs(nd.vx); }
        if (nd.y<NODE_R+4)   { nd.y=NODE_R+4;   nd.vy= Math.abs(nd.vy); }
        if (nd.y>h-NODE_R-4) { nd.y=h-NODE_R-4; nd.vy=-Math.abs(nd.vy); }
        for (const r of cachedRects) collideRect(nd,r,cRect);
        if (now>=nd.nextPulse) { nd.pulseR=NODE_R; nd.pulseA=0.45; nd.nextPulse=now+5000+Math.random()*6000; }
        if (nd.pulseA>0) { nd.pulseR+=0.5; nd.pulseA=Math.max(0,nd.pulseA-0.006); }
        if (nd.a<1) nd.a=Math.min(1,nd.a+0.025);
      }

      // ── connections ─────────────────────────────────────────────────────────
      const newConns = new Set<string>();
      const connectedNodes = new Set<number>();
      for (let i=0; i<nodes.length; i++) {
        for (let j=i+1; j<nodes.length; j++) {
          const ni=nodes[i], nj=nodes[j];
          const dist=Math.hypot(nj.x-ni.x,nj.y-ni.y);
          if (dist>=MAX_DIST) continue;
          if (cachedRects.some(r=>segBlocked(ni.x,ni.y,nj.x,nj.y,r,cRect))) continue;
          const key=`${i}-${j}`;
          newConns.add(key);
          connectedNodes.add(i); connectedNodes.add(j);
          const alpha=(1-dist/MAX_DIST)*0.28*Math.min(ni.a,nj.a);
          ctx.save();
          ctx.globalAlpha=alpha; ctx.strokeStyle=C_BLUE; ctx.lineWidth=1;
          ctx.setLineDash([5,5]); ctx.lineDashOffset=-(now/40);
          ctx.beginPath(); ctx.moveTo(ni.x,ni.y); ctx.lineTo(nj.x,nj.y); ctx.stroke();
          ctx.restore();
        }
      }

      // ── prune dropped connections ────────────────────────────────────────────
      for (const key of liveConns) {
        if (!newConns.has(key)) { estConns.delete(key); cooldowns.delete(key); }
      }
      for (let p=packets.length-1; p>=0; p--)
        if (!newConns.has(packets[p].connKey)) packets.splice(p,1);

      // ── spawn packets ────────────────────────────────────────────────────────
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

      // ── update + draw packets ────────────────────────────────────────────────
      for (let p=packets.length-1; p>=0; p--) {
        const pkt=packets[p];
        pkt.t+=PKT_SPEED;
        const ni=nodes[pkt.ai], nj=nodes[pkt.bi];
        const sx=pkt.dir===1?ni.x:nj.x, sy=pkt.dir===1?ni.y:nj.y;
        const ex=pkt.dir===1?nj.x:ni.x, ey=pkt.dir===1?nj.y:ni.y;

        // packet drop
        if (pkt.type==="data" && pkt.t>=pkt.dropAt) {
          const dt=pkt.dropAt;
          const dpx=sx+(ex-sx)*dt, dpy=sy+(ey-sy)*dt;
          drops.push({ x:dpx,y:dpy,a:1, p1r:NODE_R,p1a:0.6, p2r:NODE_R,p2a:0,p2started:false,p2t:now+350, born:now });
          if (Math.random()<0.5) msgs.push({ x:sx+rn(-20,20),y:sy-rn(16,28),text:pick(ERR_TEXTS),born:now,color:C_RED });
          cooldowns.set(pkt.connKey, now+rn(600,1400));
          packets.splice(p,1); continue;
        }

        // arrival
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
          } else {
            nodes[pkt.bi].pulseR=NODE_R; nodes[pkt.bi].pulseA=0.5;
            cooldowns.set(pkt.connKey,now+rn(200,900));
            packets.splice(p,1);
          }
          continue;
        }

        // draw packet dot
        const px=sx+(ex-sx)*pkt.t, py=sy+(ey-sy)*pkt.t;
        const pAlpha=0.92*Math.min(ni.a,nj.a);
        const dotColor=pkt.type==="ack" ? C_GREEN : C_BRIGHT;
        ctx.save();
        ctx.globalAlpha=pAlpha;
        ctx.shadowBlur=8; ctx.shadowColor=dotColor; ctx.fillStyle=dotColor;
        ctx.beginPath(); ctx.arc(px,py,pkt.type==="data"?3:3.5,0,Math.PI*2); ctx.fill();
        ctx.restore();

        // payload label
        ctx.save();
        ctx.globalAlpha=pAlpha*0.8;
        ctx.fillStyle=pkt.type==="ack" ? C_GREEN : C_BRIGHT;
        ctx.font="bold 7px 'Courier New',monospace";
        ctx.textAlign="center";
        ctx.fillText(pkt.payload,px,py-9);
        ctx.restore();
      }

      // ── drop markers ─────────────────────────────────────────────────────────
      for (let m=drops.length-1; m>=0; m--) {
        const dm=drops[m];
        const age=now-dm.born;
        if (age>1200) { drops.splice(m,1); continue; }
        if (age>900) dm.a=Math.max(0,1-(age-900)/300);

        if (dm.p1a>0) { dm.p1r+=0.7; dm.p1a=Math.max(0,dm.p1a-0.012); }
        if (now>=dm.p2t && !dm.p2started) { dm.p2a=0.55; dm.p2started=true; }
        if (dm.p2a>0) { dm.p2r+=0.7; dm.p2a=Math.max(0,dm.p2a-0.012); }

        // pulses
        for (const [pr,pa] of [[dm.p1r,dm.p1a],[dm.p2r,dm.p2a]] as [number,number][]) {
          if (pa<=0) continue;
          ctx.save(); ctx.globalAlpha=pa*dm.a;
          ctx.strokeStyle=C_RED; ctx.lineWidth=1.5; ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(dm.x,dm.y,pr,0,Math.PI*2); ctx.stroke();
          ctx.restore();
        }

        // red X
        ctx.save(); ctx.globalAlpha=dm.a;
        ctx.strokeStyle=C_RED; ctx.lineWidth=2; ctx.lineCap="round"; ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(dm.x-5,dm.y-5); ctx.lineTo(dm.x+5,dm.y+5);
        ctx.moveTo(dm.x+5,dm.y-5); ctx.lineTo(dm.x-5,dm.y+5);
        ctx.stroke(); ctx.restore();
      }

      // ── status / error messages ──────────────────────────────────────────────
      if (now>=nextMsgSpawn && nodes) {
        const nd=pick(nodes);
        msgs.push({ x:nd.x+rn(12,28),y:nd.y-rn(14,28),text:pick(ERR_TEXTS),born:now,color:C_RED });
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

      // ── nodes ─────────────────────────────────────────────────────────────────
      for (const nd of nodes) {
        // pulse ring
        if (nd.pulseA>0) {
          ctx.save(); ctx.globalAlpha=nd.pulseA*nd.a;
          ctx.strokeStyle=C_BLUE; ctx.lineWidth=1; ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(nd.x,nd.y,nd.pulseR,0,Math.PI*2); ctx.stroke();
          ctx.restore();
        }
        // glow + fill
        ctx.save(); ctx.globalAlpha=nd.a;
        ctx.shadowBlur=14; ctx.shadowColor=C_GLOW; ctx.fillStyle=C_BG;
        ctx.beginPath(); ctx.arc(nd.x,nd.y,NODE_R,0,Math.PI*2); ctx.fill();
        ctx.restore();
        // border
        ctx.save(); ctx.globalAlpha=0.42*nd.a;
        ctx.strokeStyle=C_BLUE; ctx.lineWidth=1; ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(nd.x,nd.y,NODE_R,0,Math.PI*2); ctx.stroke();
        ctx.restore();
        // icon
        ctx.save(); ctx.globalAlpha=0.72*nd.a;
        drawIcon(ctx,nd.icon,nd.x,nd.y);
        ctx.restore();
        // IP label
        ctx.save(); ctx.globalAlpha=0.38*nd.a;
        ctx.fillStyle=C_BLUE;
        ctx.font="8px 'Courier New',monospace";
        ctx.textAlign="center"; ctx.setLineDash([]);
        ctx.fillText(nd.ip,nd.x,nd.y+NODE_R+11);
        ctx.restore();
        // above-node status label
        const ndIdx=nodes.indexOf(nd);
        if (nd.status) {
          const age=now-nd.statusBorn;
          if (age>2200) { nd.status=null; }
          else {
            const a=age<300?age/300:age<1700?1:1-(age-1700)/500;
            ctx.save(); ctx.globalAlpha=a*nd.a;
            ctx.fillStyle=C_GREEN;
            ctx.font="bold 7.5px 'Courier New',monospace";
            ctx.textAlign="center"; ctx.setLineDash([]);
            ctx.fillText(nd.status,nd.x,nd.y-NODE_R-8);
            ctx.restore();
          }
        } else if (!connectedNodes.has(ndIdx) && nd.a>0.5) {
          // no connections — show searching
          const blink=Math.sin(now/600)>0;
          ctx.save(); ctx.globalAlpha=(blink?0.55:0.3)*nd.a;
          ctx.fillStyle="rgba(148,163,184,0.9)";
          ctx.font="7px 'Courier New',monospace";
          ctx.textAlign="center"; ctx.setLineDash([]);
          ctx.fillText("searching...",nd.x,nd.y-NODE_R-8);
          ctx.restore();
        }
      }

      raf=requestAnimationFrame(frame);
    }

    const roObs = new ResizeObserver(()=>{ rectsDirty=true; });
    for (const ob of obstacles) { if (ob.current) roObs.observe(ob.current); }

    const roCanvas = new ResizeObserver(()=>resize());
    roCanvas.observe(canvas);

    const onResize = () => {
      resize();
      nodes=null; packets.length=0; drops.length=0; msgs.length=0;
      liveConns.clear(); estConns.clear(); cooldowns.clear();
    };
    window.addEventListener("resize", onResize);

    resize();
    raf=requestAnimationFrame(frame);

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
