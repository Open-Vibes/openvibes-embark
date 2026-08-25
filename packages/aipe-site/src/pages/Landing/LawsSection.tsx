import Section from "../../components/Section";

const LAWS: { tag: string; title: string; body: string }[] = [
  {
    tag: "aipe dispatch validate",
    title: "The parallel-dispatch law",
    body: "The same package never runs twice at once — same-unit work serializes; distinct repos run in parallel, capped at 16 concurrent. Adjudicated mechanically, never by hand. A batch is lawful as proposed or rejected; it is never quietly reordered.",
  },
  {
    tag: "<repo>/.worktrees/<journey>-<slug>/",
    title: "Worktree isolation",
    body: "Every dispatch works in its own git worktree on its own branch. Nothing edits your working tree in place. Teardown refuses to delete uncommitted or unpushed work unless you force it.",
  },
  {
    tag: "evidence-required",
    title: "The evidence gate",
    body: "A delivery that claims done must carry the commands it ran and a summary of what the output showed. A bare self-report is REJECTed by the ledger — verify-before-done is not optional.",
  },
  {
    tag: "/review-delivery",
    title: "The QA gate",
    body: "Every dev delivery is re-checked by an independent QA persona against the diff and the acceptance criteria — not the dev's report. A unit is only 'verified' once that skeptic passes it; any Critical or Important finding blocks the merge.",
  },
  {
    tag: "dependency-not-landed",
    title: "Cross-repo escalation",
    body: "A specialist never edits another repo — it escalates the need to the coordinator, who takes it to you. A consumer can't dispatch until the producer it depends on has landed. Cross-repo scope is the PE's decision.",
  },
  {
    tag: "session containment",
    title: "Session containment",
    body: "A specialist dispatched as a real session can never open or kill an agentop session — a hook in its own worktree denies it. The one authorised escape, aipe session grant, is scoped to a single (journey, session) pair.",
  },
];

export default function LawsSection() {
  return (
    <Section
      id="laws"
      eyebrow="The laws"
      title="Six constraints the coordinator can't talk its way around."
      lead="These aren't guidelines. They're deterministic gates enforced by the aipe CLI — the reason parallel work stays safe and 'done' means something."
      className="bg-surface-1/40"
    >
      <div className="grid md:grid-cols-2 gap-4">
        {LAWS.map((law, i) => (
          <div key={law.title} className="rounded-2xl border border-line bg-surface-1 p-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-lg font-semibold text-text">{law.title}</h3>
            </div>
            <code className="mt-3 inline-block max-w-full truncate rounded-md bg-surface-2 border border-line-soft px-2 py-1 font-mono text-[11.5px] text-brand">
              {law.tag}
            </code>
            <p className="mt-3 text-sm text-muted leading-relaxed">{law.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
