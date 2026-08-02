/**
 * version.ts — put the REAL agentistics version on the page.
 *
 * The nav used to show a shields.io badge labelled "latest", which tells a
 * visitor nothing about whether what they installed is current. The number is
 * baked in at sync time from the project's own package.json (see
 * scripts/sync-docs.ts), so there is no runtime request and nothing to fail.
 */

import { AGENTISTICS_VERSION } from "./generated/version";

export function initVersion(): void {
  const nodes = document.querySelectorAll<HTMLElement>("[data-agentistics-version]");
  if (!nodes.length) return;
  // No version resolved (a sync run against a checkout without one): say
  // nothing rather than show a placeholder that looks like a real answer.
  if (!AGENTISTICS_VERSION) {
    nodes.forEach(n => n.closest("a")?.remove() ?? n.remove());
    return;
  }
  nodes.forEach(n => { n.textContent = `v${AGENTISTICS_VERSION}`; });
}
