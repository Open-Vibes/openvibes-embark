import type { ReactNode } from "react";
import Reveal from "./Reveal";

interface SectionProps {
  id: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Constrain content width. Defaults to the site content max. */
  narrow?: boolean;
}

/**
 * A landing section shell that holds the vertical rhythm: consistent top/bottom
 * padding, an optional eyebrow → title → lead header, and a scroll anchor.
 */
export default function Section({ id, eyebrow, title, lead, children, className = "", narrow = false }: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 px-5 sm:px-6 py-20 sm:py-28 ${className}`}>
      <div className={`mx-auto ${narrow ? "max-w-3xl" : "max-w-content"}`}>
        {(eyebrow || title || lead) && (
          <Reveal>
            <header className="mb-12 sm:mb-16">
              {eyebrow && (
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-3">{eyebrow}</p>
              )}
              {title && (
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text leading-tight max-w-2xl">
                  {title}
                </h2>
              )}
              {lead && <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed max-w-2xl">{lead}</p>}
            </header>
          </Reveal>
        )}
        <Reveal delay={0.05}>{children}</Reveal>
      </div>
    </section>
  );
}
