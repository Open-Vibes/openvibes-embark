import Section from "../../components/Section";

const ROLES: { role: string; who: string; does: string; accent: string }[] = [
  {
    role: "Product Engineer",
    who: "You.",
    does: "Set the mission and the priority, approve the budget, and decide anything that crosses repo boundaries. In command, approving between phases.",
    accent: "--brand",
  },
  {
    role: "Coordinator",
    who: "The main Claude, with a name you give it.",
    does: "Reads the state of every repo, decomposes each demand, dispatches the specialists, reviews what comes back, and escalates cross-repo calls to you.",
    accent: "--st-dispatched",
  },
  {
    role: "Specialists",
    who: "One dev + one QA, hired per repo.",
    does: "Subagents that wear a persona installed inside their repo. Each works confined to its own worktree and opens its own PR — and never edits another repo.",
    accent: "--st-verified",
  },
];

export default function CompanySection() {
  return (
    <Section
      id="company"
      eyebrow="The company analogy"
      title="AIPe runs your repos like a company runs its teams."
      lead="It's the mental model the whole product is built on: you're the executive with the demand; the coordinator is your engineering lead; the specialists are contractors hired per repo."
    >
      <div className="grid md:grid-cols-3 gap-4">
        {ROLES.map((r, i) => (
          <div key={r.role} className="relative rounded-2xl border border-line bg-surface-1 p-6">
            <div className="flex items-center gap-3">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg font-mono text-sm font-semibold"
                style={{ color: `rgb(var(${r.accent}))`, backgroundColor: `rgb(var(${r.accent}) / 0.14)` }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="font-display text-lg font-semibold text-text">{r.role}</h3>
            </div>
            <p className="mt-4 text-sm font-medium text-text">{r.who}</p>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{r.does}</p>
            {i < ROLES.length - 1 && (
              <span aria-hidden="true" className="hidden md:block absolute top-1/2 -right-2.5 text-faint">→</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-faint max-w-2xl">
        Everything past raw agent output on disk is a deterministic, tested <code className="font-mono text-muted">aipe</code> CLI;
        the coordinator's judgement lives in prose. The org chart is real, and you can watch it work.
      </p>
    </Section>
  );
}
