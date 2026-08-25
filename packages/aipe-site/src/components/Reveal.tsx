import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../lib/useReducedMotion";

interface RevealProps {
  children: ReactNode;
  /** Stagger index for a small cascade. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}

/**
 * A one-shot entrance: fade + rise as the element scrolls into view. Under
 * reduced-motion it renders the children plainly (fully visible, no transform) —
 * never a hidden or empty box.
 */
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
