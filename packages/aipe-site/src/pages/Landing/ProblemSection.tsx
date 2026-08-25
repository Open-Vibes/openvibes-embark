import Section from "../../components/Section";

const COSTS: { title: string; body: string }[] = [
  {
    title: "You are the router",
    body: "One agent, one repo, one thread. Every demand that spans services turns you into the message bus — copying context between chats, re-explaining the same architecture, holding the plan in your head.",
  },
  {
    title: "Work that could be parallel runs serial",
    body: "Three repos need the same feature. Nothing stops them running at once — except that you can only babysit one session at a time, so they queue behind your attention.",
  },
  {
    title: "No isolation, no undo",
    body: "Agents edit your working tree in place. A half-finished change collides with the next one; a bad run leaves you cleaning up instead of merging.",
  },
  {
    title: "“Done” is a self-report",
    body: "The agent says it passed. Did it run anything? There's no gate between a confident summary and a merge — so review is on you, every time.",
  },
  {
    title: "Cross-repo order is guesswork",
    body: "The API has to land before the client that calls it. Get the order wrong and you ship a build against a contract that doesn't exist yet.",
  },
  {
    title: "The audit trail evaporates",
    body: "Which agent did what, with what evidence, in what order? It scrolls off the top of a terminal. Next week, none of it is recoverable.",
  },
];

export default function ProblemSection() {
  return (
    <Section
      id="problem"
      eyebrow="The problem"
      title="Coordinating agents across many repos is a job. Right now, it's yours."
      lead="A single coding agent is powerful in one repository. The moment a demand touches several, the coordination overhead lands entirely on you."
      className="bg-surface-1/40"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COSTS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line bg-surface-1 p-6">
            <div className="mb-3 h-8 w-8 rounded-lg border border-state-failed/40 bg-state-failed/10 grid place-items-center text-state-failed" aria-hidden="true">
              ✕
            </div>
            <h3 className="font-display text-lg font-semibold text-text">{c.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
