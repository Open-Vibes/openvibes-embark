import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../../lib/useReducedMotion";

/**
 * The hero backdrop — AIPe's real flow, transcribed from the PE's own hand-drawn
 * diagram (orientation.md v3), not a generic graph. Left to right it runs the
 * pipeline the product actually executes:
 *
 *   demands (by area) → PE → coordinator → fan-out to specialists, each in its
 *   own harness → QA reviews (wave 2, AFTER the dev) → repositories.
 *
 * Every element maps to something AIPe does (the mapping is listed in SPEC.md):
 *  - four demand boxes = demands entering by area (Front / Back / QA / Sustain);
 *  - the PE node = where a demand enters the system;
 *  - the coordinator = decompose + dispatch;
 *  - four specialist nodes, each tagged with a DIFFERENT harness (claude, gemini,
 *    codex, antigravity) = the multi-harness fan-out, shown not described;
 *  - a QA node the dev's delivery passes THROUGH before a repo = the wave-2 gate;
 *  - a RED token returning QA → specialist = a rejection opening the correction
 *    loop (the product isn't only the happy path — showing only success would lie);
 *  - repo squares on the right = "integrated"; and two lanes deliver to the SAME
 *    square = two specialists in one repo at once, which path-lock (j-20260826-xj)
 *    is exactly what made lawful.
 *
 * It is decorative chrome: `aria-hidden`, no essential text (the headline stays
 * crisp DOM for LCP + a11y; a DOM legend under the copy names the beats). Under
 * `prefers-reduced-motion: reduce` it draws ONE complete still frame — the whole
 * pipeline with tokens frozen mid-flight, including the red rejection and the
 * convergence — and never animates. DPR capped at 2; the RAF loop stops when the
 * tab is hidden or the hero scrolls out of view.
 */

type RGB = [number, number, number];

function readTriple(styles: CSSStyleDeclaration, name: string, fallback: RGB): RGB {
  const raw = styles.getPropertyValue(name).trim();
  const parts = raw.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
  return parts.length === 3 ? (parts as RGB) : fallback;
}

interface Palette {
  brand: RGB;
  brandStrong: RGB;
  dispatched: RGB;
  delivered: RGB;
  verified: RGB;
  failed: RGB;
  running: RGB;
  line: RGB;
  faint: RGB;
  text: RGB;
}

function readPalette(root: HTMLElement): Palette {
  const s = getComputedStyle(root);
  return {
    brand: readTriple(s, "--brand", [141, 125, 255]),
    brandStrong: readTriple(s, "--brand-strong", [172, 158, 255]),
    dispatched: readTriple(s, "--st-dispatched", [76, 154, 255]),
    delivered: readTriple(s, "--st-delivered", [32, 202, 182]),
    verified: readTriple(s, "--st-verified", [61, 210, 100]),
    failed: readTriple(s, "--st-failed", [240, 90, 90]),
    running: readTriple(s, "--st-running", [232, 170, 60]),
    line: readTriple(s, "--line", [40, 43, 60]),
    faint: readTriple(s, "--faint", [122, 126, 150]),
    text: readTriple(s, "--text", [230, 232, 240]),
  };
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

type Vec = { x: number; y: number };

/** The five harnesses tagged on the fan-out — a real mix of contained and not. */
const HARNESS_TAGS = ["claude", "gemini", "codex", "antigravity"] as const;
const LANES = 4;
/** repo each lane delivers to. Lanes 0 and 1 share repo 0 → the convergence. */
const REPO_OF = [0, 0, 1, 2];
const REPO_COUNT = 3;
/** Lane 2 always demonstrates a QA rejection + correction loop. */
const REJECT_LANE = 2;

type HopKind = "dispatch" | "review" | "approve" | "reject";

interface Hop {
  from: Vec;
  to: Vec;
  kind: HopKind;
}

interface Token {
  lane: number;
  hops: Hop[];
  hop: number;
  t: number;
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    let palette = readPalette(root);

    let width = 0;
    let height = 0;
    let dpr = 1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    let seed = 20260829;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const PARTICLE_COUNT = 54;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: rnd(),
      y: rnd(),
      z: rnd(),
      vx: (rnd() - 0.5) * 0.00005,
      vy: (rnd() - 0.5) * 0.00005,
      tw: rnd() * Math.PI * 2,
    }));

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ---- Node geometry (responsive). Left→right pipeline; the "input" side sits
    // under the copy (dimmed by the hero scrim), the "output" side in the clear. --
    const wide = () => width >= 640;
    const cy = () => (wide() ? height * 0.5 : height * 0.46);
    const vspan = () => (wide() ? Math.min(height * 0.62, 360) : height * 0.5);

    function demandPos(i: number): Vec {
      const gap = vspan() / LANES;
      return { x: width * (wide() ? 0.055 : 0.1), y: cy() + (i - (LANES - 1) / 2) * gap };
    }
    const pePos = (): Vec => ({ x: width * (wide() ? 0.2 : 0.26), y: cy() });
    const coordPos = (): Vec => ({ x: width * (wide() ? 0.34 : 0.46), y: cy() });
    function specPos(i: number): Vec {
      const gap = vspan() / LANES;
      return { x: width * (wide() ? 0.56 : 0.64), y: cy() + (i - (LANES - 1) / 2) * gap };
    }
    const qaPos = (): Vec => ({ x: width * (wide() ? 0.74 : 0.82), y: cy() });
    function repoPos(j: number): Vec {
      const gap = vspan() / (REPO_COUNT + 0.5);
      return { x: width * (wide() ? 0.93 : 0.93), y: cy() + (j - (REPO_COUNT - 1) / 2) * gap };
    }
    const sharedPos = (): Vec => ({ x: width * (wide() ? 0.56 : 0.64), y: cy() - vspan() / 2 - (wide() ? 34 : 26) });

    /** Build the ordered hops one lane's token travels (with the correction loop). */
    function buildHops(lane: number, reject: boolean): Hop[] {
      const d = demandPos(lane);
      const pe = pePos();
      const co = coordPos();
      const sp = specPos(lane);
      const qa = qaPos();
      const repo = repoPos(REPO_OF[lane]!);
      const hops: Hop[] = [
        { from: d, to: pe, kind: "dispatch" },
        { from: pe, to: co, kind: "dispatch" },
        { from: co, to: sp, kind: "dispatch" },
        { from: sp, to: qa, kind: "review" },
      ];
      if (reject) {
        hops.push({ from: qa, to: sp, kind: "reject" });
        hops.push({ from: sp, to: qa, kind: "review" });
      }
      hops.push({ from: qa, to: repo, kind: "approve" });
      return hops;
    }

    const tokens: Token[] = [];
    const LANE_PERIOD = 4200;
    const laneNextEmit = Array.from({ length: LANES }, (_, i) => i * (LANE_PERIOD / LANES));
    const repoFlash = Array.from({ length: REPO_COUNT }, () => 0);

    function hopColor(kind: HopKind): RGB {
      switch (kind) {
        case "dispatch":
          return palette.brandStrong;
        case "review":
          return palette.delivered;
        case "approve":
          return palette.verified;
        case "reject":
          return palette.failed;
      }
    }

    /** A gentle curve between two nodes so parallel hops don't overlap into one line. */
    function ctrl(a: Vec, b: Vec, bow: number): Vec {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      // perpendicular offset
      return { x: mx + (-dy / len) * bow, y: my + (dx / len) * bow };
    }

    function quad(t: number, a: Vec, c: Vec, b: Vec): Vec {
      const u = 1 - t;
      return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
    }

    function drawEdge(a: Vec, b: Vec, color: RGB, alpha: number, bow: number, wLine: number) {
      const c = ctrl(a, b, bow);
      ctx!.strokeStyle = rgba(color, alpha);
      ctx!.lineWidth = wLine;
      ctx!.beginPath();
      ctx!.moveTo(a.x, a.y);
      ctx!.quadraticCurveTo(c.x, c.y, b.x, b.y);
      ctx!.stroke();
    }

    function drawDot(p: Vec, r: number, color: RGB, glow: number, fill: number) {
      const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * glow);
      g.addColorStop(0, rgba(color, 0.5));
      g.addColorStop(1, rgba(color, 0));
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, r * glow, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = rgba(color, fill);
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawSquare(p: Vec, s: number, color: RGB, fill: number, flash: number) {
      if (flash > 0) {
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3);
        g.addColorStop(0, rgba(palette.verified, 0.5 * flash));
        g.addColorStop(1, rgba(palette.verified, 0));
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, s * 3, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.fillStyle = rgba(color, fill);
      ctx!.strokeStyle = rgba(color, 0.8);
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      ctx!.rect(p.x - s, p.y - s, s * 2, s * 2);
      ctx!.fill();
      ctx!.stroke();
    }

    function label(p: Vec, text: string, color: RGB, alpha: number, dx: number, dy: number, align: CanvasTextAlign) {
      ctx!.font = "600 10px 'JetBrains Mono', ui-monospace, monospace";
      ctx!.textAlign = align;
      ctx!.textBaseline = "middle";
      ctx!.fillStyle = rgba(color, alpha);
      ctx!.fillText(text, p.x + dx, p.y + dy);
    }

    function bowFor(hop: Hop, lane: number): number {
      // Fan-out and fan-in hops bow away from centre by lane; review/approve keep near-straight.
      if (hop.kind === "reject") return -18;
      const base = wide() ? 26 : 16;
      return (lane - (LANES - 1) / 2) * (base / 1.5);
    }

    function drawScene(now: number, animated: boolean) {
      ctx!.clearRect(0, 0, width, height);
      const showLabels = wide();

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      // 1) Ambient particles.
      for (const p of particles) {
        if (animated) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x += 1;
          if (p.x > 1) p.x -= 1;
          if (p.y < 0) p.y += 1;
          if (p.y > 1) p.y -= 1;
        }
        const par = (p.z - 0.5) * 22;
        const px = p.x * width + pointer.x * par;
        const py = p.y * height + pointer.y * par;
        const size = 0.5 + p.z * 1.4;
        const tw = animated ? 0.7 + 0.3 * Math.sin(now * 0.0012 + p.tw) : 1;
        ctx!.fillStyle = rgba(palette.faint, (0.1 + p.z * 0.34) * tw);
        ctx!.beginPath();
        ctx!.arc(px, py, size, 0, Math.PI * 2);
        ctx!.fill();
      }

      const pe = pePos();
      const co = coordPos();
      const qa = qaPos();
      const shared = sharedPos();

      // 2) Static edges — the pipeline's wiring.
      for (let i = 0; i < LANES; i++) {
        drawEdge(demandPos(i), pe, palette.line, 0.5, bowFor({ from: demandPos(i), to: pe, kind: "dispatch" }, i), 1);
      }
      drawEdge(pe, co, palette.line, 0.6, 0, 1.2);
      for (let i = 0; i < LANES; i++) {
        const sp = specPos(i);
        drawEdge(co, sp, palette.brand, 0.16, bowFor({ from: co, to: sp, kind: "dispatch" }, i), 1);
        drawEdge(sp, qa, palette.line, 0.4, -bowFor({ from: sp, to: qa, kind: "review" }, i) / 2, 1);
        drawEdge(sp, shared, palette.line, 0.25, 0, 0.8);
      }
      for (let j = 0; j < REPO_COUNT; j++) {
        drawEdge(qa, repoPos(j), palette.line, 0.4, 0, 1);
      }

      // 3) Emit + advance tokens.
      if (animated) {
        for (let lane = 0; lane < LANES; lane++) {
          if (now >= laneNextEmit[lane]!) {
            laneNextEmit[lane] = now + LANE_PERIOD;
            tokens.push({ lane, hops: buildHops(lane, lane === REJECT_LANE), hop: 0, t: 0 });
          }
        }
      } else if (tokens.length === 0) {
        // Static frame: freeze a token on every lane at a telling moment, so the
        // whole story reads at once — including the rejection and the convergence.
        tokens.push(
          { lane: 0, hops: buildHops(0, false), hop: 4, t: 0.55 }, // approaching the shared repo
          { lane: 1, hops: buildHops(1, false), hop: 4, t: 0.3 }, // second lane, same repo → convergence
          { lane: 2, hops: buildHops(2, true), hop: 4, t: 0.5 }, // the red rejection, QA → specialist
          { lane: 3, hops: buildHops(3, false), hop: 2, t: 0.6 }, // still dispatching
        );
      }

      const dt = animated ? 0.9 / 60 : 0;
      for (let k = tokens.length - 1; k >= 0; k--) {
        const tok = tokens[k]!;
        // Rebuild hop endpoints against current layout (handles resize mid-flight).
        const fresh = buildHops(tok.lane, tok.hops.length > 5);
        tok.hops = fresh;
        tok.t += dt;
        if (tok.t >= 1) {
          if (tok.hop >= tok.hops.length - 1) {
            if (animated) {
              repoFlash[REPO_OF[tok.lane]!] = 1;
              tokens.splice(k, 1);
              continue;
            }
          } else if (animated) {
            tok.hop += 1;
            tok.t = 0;
          } else {
            tok.t = 1;
          }
        }
        const hop = tok.hops[Math.min(tok.hop, tok.hops.length - 1)]!;
        const bow = bowFor(hop, tok.lane) * (hop.kind === "review" || hop.kind === "approve" ? 0.4 : 1);
        const c = ctrl(hop.from, hop.to, bow);
        const pos = quad(tok.t, hop.from, c, hop.to);
        const color = hopColor(hop.kind);

        ctx!.globalCompositeOperation = "lighter";
        const gr = ctx!.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 8);
        gr.addColorStop(0, rgba(color, 0.9));
        gr.addColorStop(1, rgba(color, 0));
        ctx!.fillStyle = gr;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalCompositeOperation = "source-over";

        if (hop.kind === "approve") {
          // A returning artefact (the PR/merge) is a small diamond, not a spark.
          ctx!.save();
          ctx!.translate(pos.x, pos.y);
          ctx!.rotate(Math.PI / 4);
          ctx!.fillStyle = rgba(color, 0.95);
          ctx!.fillRect(-2.4, -2.4, 4.8, 4.8);
          ctx!.restore();
        } else {
          ctx!.fillStyle = rgba(color, 0.95);
          ctx!.beginPath();
          ctx!.arc(pos.x, pos.y, hop.kind === "reject" ? 3 : 2.4, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // 4) Nodes.
      // Demands (areas) — small squares feeding in.
      for (let i = 0; i < LANES; i++) {
        drawSquare(demandPos(i), 3.2, palette.dispatched, 0.5, 0);
      }
      if (showLabels) label(demandPos(0), "demands", palette.faint, 0.7, 0, -12, "center");

      // Shared resources (MCPs / skills / frameworks) all specialists draw on.
      drawDot(shared, 4, palette.delivered, 3, 0.7);
      if (showLabels) label(shared, "shared: MCPs · skills", palette.faint, 0.7, 0, -11, "center");

      // PE (person / entry).
      drawDot(pe, 5, palette.text, 3, 0.85);
      if (showLabels) label(pe, "PE", palette.faint, 0.85, 0, -12, "center");

      // Coordinator — the hub, softly breathing.
      const breathe = animated ? 1 + 0.05 * Math.sin(now * 0.0018) : 1;
      ctx!.strokeStyle = rgba(palette.brand, 0.3);
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(co.x, co.y, 15 * breathe, 0, Math.PI * 2);
      ctx!.stroke();
      drawDot(co, 9 * breathe, palette.brand, 4, 0.95);
      if (showLabels) label(co, "coordinator", palette.faint, 0.85, 0, -22, "center");

      // Specialists — each in its own harness (the multi-harness fan-out).
      for (let i = 0; i < LANES; i++) {
        const sp = specPos(i);
        drawDot(sp, 5, palette.brandStrong, 3, 0.9);
        if (showLabels) label(sp, HARNESS_TAGS[i]!, palette.faint, 0.8, 12, 0, "left");
      }

      // QA node — the wave-2 gate the dev's delivery passes through.
      ctx!.strokeStyle = rgba(palette.verified, 0.35);
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(qa.x, qa.y, 11, 0, Math.PI * 2);
      ctx!.stroke();
      drawDot(qa, 6, palette.delivered, 3, 0.9);
      if (showLabels) label(qa, "QA · wave 2", palette.faint, 0.85, 0, -16, "center");

      // Repos — the destination squares. Two lanes land on repo 0 (convergence).
      for (let j = 0; j < REPO_COUNT; j++) {
        if (animated) repoFlash[j] = Math.max(0, repoFlash[j]! - 0.02);
        drawSquare(repoPos(j), 5, palette.verified, 0.18, animated ? repoFlash[j]! : j === 0 ? 0.6 : 0);
      }
      if (showLabels) label(repoPos(0), "repos", palette.faint, 0.75, 12, 0, "left");
    }

    let raf = 0;
    let running = false;
    const loop = (now: number) => {
      drawScene(now, true);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onResize = () => {
      layout();
      if (reduced || !running) {
        tokens.length = 0;
        drawScene(performance.now(), false);
      }
    };
    const onPointer = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    layout();

    const themeObserver = new MutationObserver(() => {
      palette = readPalette(root);
      if (reduced || !running) drawScene(performance.now(), false);
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      drawScene(performance.now(), false);
    } else {
      start();
    }

    return () => {
      stop();
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
