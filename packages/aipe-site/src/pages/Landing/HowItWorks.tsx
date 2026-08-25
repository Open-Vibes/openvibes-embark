import Section from "../../components/Section";

const ONBOARDING: { cmd: string; title: string; body: string }[] = [
  { cmd: "/context-brain", title: "Declare the repos", body: "Name the repositories in your context — URLs and paths — into .aipe/brain.yaml." },
  { cmd: "/make-workspace", title: "Clone them on disk", body: "Check the repos out locally and rehydrate the personas and toolbox." },
  { cmd: "/relationship", title: "Discover the relations", body: "Map how the repos depend on each other and backfill each one's stack." },
  { cmd: "/hire-specialists", title: "Hire the specialists", body: "Install one dev + one QA persona skill per repo into .aipe/personas.yaml." },
];

const OPERATION: { step: string; body: string }[] = [
  { step: "journey", body: "One demand opens one journey — the durable record of everything dispatched." },
  { step: "decompose", body: "The demand is split into per-repo tasks." },
  { step: "waves", body: "Tasks are sequenced dependency-first, using the cross-repo relation graph." },
  { step: "dispatch", body: "Each wave validates the law, provisions a worktree, and sends each specialist off in parallel." },
  { step: "PR", body: "Every specialist returns a delivery — a PR with evidence attached." },
  { step: "escalate", body: "Anything cross-repo comes back to you; it's the PE's call before the next wave." },
];

export default function HowItWorks() {
  return (
    <Section
      id="how"
      eyebrow="How it works"
      title="Two phases, both complete: onboard once, then operate."
      lead="Onboarding teaches the coordinator your world. Operation is the loop it runs on every demand after that."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Onboarding */}
        <div className="rounded-2xl border border-line bg-surface-1 p-6 sm:p-7">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-xl font-semibold text-text">Onboarding</h3>
            <span className="font-mono text-xs text-faint">4 steps · once</span>
          </div>
          <p className="mt-1 text-sm text-muted">Each step is a skill; the next one only unlocks when the last is done. Re-running fills in only what's missing.</p>
          <ol className="mt-5 space-y-4">
            {ONBOARDING.map((s, i) => (
              <li key={s.cmd} className="flex gap-4">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-surface-2 font-mono text-xs text-brand">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <code className="font-mono text-[13px] text-brand">{s.cmd}</code>
                  <p className="text-sm font-medium text-text">{s.title}</p>
                  <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Operation */}
        <div className="rounded-2xl border border-line bg-surface-1 p-6 sm:p-7">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-xl font-semibold text-text">Operation</h3>
            <span className="font-mono text-xs text-faint">/operate · every demand</span>
          </div>
          <p className="mt-1 text-sm text-muted">The coordinator runs this loop for every demand you bring, dependency-first across your repos.</p>
          <ol className="mt-5 space-y-2.5">
            {OPERATION.map((s, i) => (
              <li key={s.step} className="flex gap-3 items-start">
                <code className="mt-0.5 shrink-0 rounded-md bg-brand/12 px-2 py-1 font-mono text-[12px] font-semibold text-brand">
                  {s.step}
                </code>
                <p className="text-sm text-muted leading-relaxed">
                  {s.body}
                </p>
                {i < OPERATION.length - 1 && <span aria-hidden="true" className="sr-only">then</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
