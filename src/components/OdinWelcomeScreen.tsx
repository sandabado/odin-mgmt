"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OdinOrbitMark } from "@/components/OdinOrbitMark";

export interface OdinWelcomeScreenProps {
  visible: boolean;
  eyebrow?: string;
  title?: string;
  detail?: string;
}

/** Full-screen threshold state used while ØDIN hands a visitor into private operations. */
export function OdinWelcomeScreen({
  visible,
  eyebrow = "Private operations",
  title = "Welcome to ØDIN.",
  detail = "Opening the operations field.",
}: OdinWelcomeScreenProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.55;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-live="polite"
          className="odin-welcome-screen"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="status"
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="odin-welcome-screen__field" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="odin-welcome-screen__content"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ delay: reduceMotion ? 0 : 0.12, duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <OdinOrbitMark className="odin-welcome-screen__mark" decorative />
            <p className="odin-welcome-screen__eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="odin-welcome-screen__detail">{detail}</p>
            <div className="odin-welcome-screen__signal" aria-hidden="true"><span /></div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
