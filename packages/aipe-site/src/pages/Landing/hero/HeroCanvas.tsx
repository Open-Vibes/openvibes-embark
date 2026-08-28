import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../../lib/useReducedMotion";

/**
 * The hero backdrop — AIPe's own nature, rendered. A coordinator core (left) fans
 * specialists out along arcs to a column of repo nodes (right); each dispatch pulse
 * that lands sends a PR token travelling back, where it merges in a soft flash. An
 * ambient particle field with pointer parallax carries the depth. It is the product
 * metaphor — dispatch out, PRs back, under one hub — not a generic gradient.
 *
 * It is decorative: `aria-hidden`, no text (the headline stays crisp DOM for LCP and
 * a11y), and it never blocks first paint — the canvas mounts and starts its loop in
 * an effect, after the headline has painted. Colors are read from the live CSS theme
 * variables, so it re-tints instantly when the theme toggles.
 *
 * Performance contract: device-pixel-ratio capped at 2; the RAF loop stops when the
 * tab is hidden or the hero scrolls out of view; particle and pulse counts are modest.
 * Under `prefers-reduced-motion: reduce` it draws ONE complete, still composition —
 * edges, nodes, a few frozen pulses and PR tokens — and never animates.
 */

const REPO_COUNT = 4;
const PARTICLE_COUNT = 72;
const LANE_PERIOD = 2600; // ms between a lane's dispatch pulses
const PULSE_SPEED = 0.55; // fraction of the arc per second

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
  verified: RGB;
  delivered: RGB;
  line: RGB;
  faint: RGB;
}

function readPalette(root: HTMLElement): Palette {
  const s = getComputedStyle(root);
  return {
    brand: readTriple(s, "--brand", [141, 125, 255]),
    brandStrong: readTriple(s, "--brand-strong", [172, 158, 255]),
    dispatched: readTriple(s, "--st-dispatched", [76, 154, 255]),
    verified: readTriple(s, "--st-verified", [61, 210, 100]),
    delivered: readTriple(s, "--st-delivered", [32, 202, 182]),
    line: readTriple(s, "--line", [40, 43, 60]),
    faint: readTriple(s, "--faint", [122, 126, 150]),
  };
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

/** A point on the quadratic arc between core and a repo (control lifts it off the chord). */
function arc(t: number, ax: number, ay: number, cx: number, cy: number, bx: number, by: number) {
  const u = 1 - t;
  return {
    x: u * u * ax + 2 * u * t * cx + t * t * bx,
    y: u * u * ay + 2 * u * t * cy + t * t * by,
  };
}

interface Pulse {
  lane: number;
  t: number;
  /** true while travelling core→repo (dispatch); false while returning repo→core (PR). */
  outbound: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number; // depth 0..1 (drives size, opacity, parallax)
  vx: number;
  vy: number;
  tw: number; // twinkle phase
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

    // Deterministic-ish scatter (no Math.random dependence on first frame ordering).
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: rnd(),
      y: rnd(),
      z: rnd(),
      vx: (rnd() - 0.5) * 0.00006,
      vy: (rnd() - 0.5) * 0.00006,
      tw: rnd() * Math.PI * 2,
    }));

    const pulses: Pulse[] = [];
    const laneNextEmit = Array.from({ length: REPO_COUNT }, (_, i) => i * (LANE_PERIOD / REPO_COUNT));

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function corePos() {
      // Wide screens: the fan lives in the right half, beside (not under) the copy
      // column. Narrow screens: centred near the top, above a downward fan.
      const x = width < 640 ? width * 0.5 : width * 0.6;
      const y = width < 640 ? height * 0.3 : height * 0.5;
      return { x, y };
    }

    function repoPos(i: number) {
      if (width < 640) {
        // A shallow arc below the core so the fan still reads when stacked.
        const spread = width * 0.42;
        const x = width * 0.5 + (i - (REPO_COUNT - 1) / 2) * (spread / (REPO_COUNT - 1));
        return { x, y: height * 0.68 };
      }
      const top = height * 0.16;
      const bottom = height * 0.84;
      const y = top + (i / (REPO_COUNT - 1)) * (bottom - top);
      return { x: width * 0.9, y };
    }

    function controlPos(i: number, outbound: boolean) {
      const core = corePos();
      const repo = repoPos(i);
      const mx = (core.x + repo.x) / 2;
      const my = (core.y + repo.y) / 2;
      // Outbound arcs bow one way, returning arcs bow the other, so dispatch and PR
      // never overlap into a single line.
      const lift = (outbound ? -1 : 1) * (width < 640 ? 24 : 44);
      return { x: mx, y: my + lift };
    }

    function drawNode(x: number, y: number, r: number, color: RGB, glow: number, fill: number) {
      const g = ctx!.createRadialGradient(x, y, 0, x, y, r * glow);
      g.addColorStop(0, rgba(color, 0.55));
      g.addColorStop(1, rgba(color, 0));
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(x, y, r * glow, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = rgba(color, fill);
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawScene(now: number, animated: boolean) {
      ctx!.clearRect(0, 0, width, height);
      const core = corePos();

      // Pointer parallax (subtle), eased toward the target each frame.
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      // 1) Ambient particle field — depth via z (size/opacity), parallax by pointer.
      for (const p of particles) {
        if (animated) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x += 1;
          if (p.x > 1) p.x -= 1;
          if (p.y < 0) p.y += 1;
          if (p.y > 1) p.y -= 1;
        }
        const par = (p.z - 0.5) * 26;
        const px = p.x * width + pointer.x * par;
        const py = p.y * height + pointer.y * par;
        const size = 0.5 + p.z * 1.6;
        const base = 0.12 + p.z * 0.4;
        const tw = animated ? 0.7 + 0.3 * Math.sin(now * 0.0013 + p.tw) : 1;
        ctx!.fillStyle = rgba(palette.faint, base * tw);
        ctx!.beginPath();
        ctx!.arc(px, py, size, 0, Math.PI * 2);
        ctx!.fill();
      }

      // 2) Fan edges — the coordinator's reach to each repo.
      for (let i = 0; i < REPO_COUNT; i++) {
        const repo = repoPos(i);
        const ctrl = controlPos(i, true);
        ctx!.strokeStyle = rgba(palette.brand, 0.2);
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(core.x, core.y);
        ctx!.quadraticCurveTo(ctrl.x, ctrl.y, repo.x, repo.y);
        ctx!.stroke();
      }

      // 3) Emit + advance pulses.
      if (animated) {
        for (let lane = 0; lane < REPO_COUNT; lane++) {
          if (now >= laneNextEmit[lane]!) {
            laneNextEmit[lane] = now + LANE_PERIOD;
            pulses.push({ lane, t: 0, outbound: true });
          }
        }
      } else if (pulses.length === 0) {
        // Static frame: freeze a readable spread of pulses and PR tokens mid-flight.
        pulses.push(
          { lane: 0, t: 0.62, outbound: true },
          { lane: 1, t: 0.34, outbound: true },
          { lane: 2, t: 0.5, outbound: false },
          { lane: 3, t: 0.78, outbound: false },
        );
      }

      const dt = animated ? PULSE_SPEED / 60 : 0;
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k]!;
        pulse.t += dt;
        if (pulse.t >= 1) {
          if (pulse.outbound && animated) {
            // Landed at the repo → a PR starts its journey home.
            pulse.outbound = false;
            pulse.t = 0;
          } else {
            if (!pulse.outbound && animated) {
              // Merged at the core → a brief flash (handled by core glow pulsing).
            }
            if (animated) {
              pulses.splice(k, 1);
              continue;
            }
          }
        }
        const repo = repoPos(pulse.lane);
        const ctrl = controlPos(pulse.lane, pulse.outbound);
        const from = pulse.outbound ? core : repo;
        const to = pulse.outbound ? repo : core;
        const pos = arc(pulse.t, from.x, from.y, ctrl.x, ctrl.y, to.x, to.y);
        const color = pulse.outbound ? palette.brandStrong : palette.verified;

        ctx!.globalCompositeOperation = "lighter";
        const gr = ctx!.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 9);
        gr.addColorStop(0, rgba(color, 0.9));
        gr.addColorStop(1, rgba(color, 0));
        ctx!.fillStyle = gr;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalCompositeOperation = "source-over";

        if (pulse.outbound) {
          ctx!.fillStyle = rgba(color, 0.95);
          ctx!.beginPath();
          ctx!.arc(pos.x, pos.y, 2.4, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          // PR tokens are small squares — a returning artefact, not a spark.
          ctx!.save();
          ctx!.translate(pos.x, pos.y);
          ctx!.rotate(Math.PI / 4);
          ctx!.fillStyle = rgba(color, 0.95);
          ctx!.fillRect(-2.2, -2.2, 4.4, 4.4);
          ctx!.restore();
        }
      }

      // 4) Repo nodes.
      for (let i = 0; i < REPO_COUNT; i++) {
        const repo = repoPos(i);
        drawNode(repo.x, repo.y, 5, palette.dispatched, 4.5, 0.85);
      }

      // 5) The coordinator core — the focal hub: larger, softly breathing, ringed.
      const breathe = animated ? 1 + 0.06 * Math.sin(now * 0.0018) : 1;
      ctx!.strokeStyle = rgba(palette.brand, 0.35);
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(core.x, core.y, 18 * breathe, 0, Math.PI * 2);
      ctx!.stroke();
      drawNode(core.x, core.y, 11 * breathe, palette.brand, 6, 0.95);
      drawNode(core.x, core.y, 4, palette.brandStrong, 3, 1);
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
      if (reduced || !running) drawScene(performance.now(), false);
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

    // Re-tint on theme toggle (the <html> class flips light/dark).
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(root);
      if (reduced || !running) drawScene(performance.now(), false);
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

    // Only burn frames while the hero is actually on screen.
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
