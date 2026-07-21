"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MouseEvent, useEffect, useState } from "react";
import { OdinWelcomeScreen } from "@/components/OdinWelcomeScreen";

export interface EnterOdinLinkProps {
  className?: string;
  href?: string;
}

const MotionLink = motion.create(Link);

/** Animated public-to-private entry link with a branded navigation handoff. */
export function EnterOdinLink({ className = "", href = "/login" }: EnterOdinLinkProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  useEffect(() => {
    if (!entering) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => router.push(href), reduceMotion ? 300 : 900);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [entering, href, reduceMotion, router]);

  function enter(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!entering) setEntering(true);
  }

  return (
    <>
      <MotionLink
        aria-label="Enter ØDIN private operations"
        className={`header-link enter-odin-link ${className}`.trim()}
        href={href}
        initial="rest"
        onClick={enter}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        variants={{
          rest: { y: 0, scale: 1 },
          hover: reduceMotion ? { y: 0 } : { y: -2 },
          tap: reduceMotion ? { scale: 1 } : { scale: 0.98 },
        }}
        whileFocus="hover"
        whileHover="hover"
        whileTap="tap"
      >
        <span className="enter-odin-link__wash" aria-hidden="true" />
        <span className="enter-odin-link__label">Enter ØDIN</span>
        <motion.span
          aria-hidden="true"
          className="enter-odin-link__arrow"
          transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
        >
          →
        </motion.span>
      </MotionLink>
      <OdinWelcomeScreen visible={entering} detail="Connecting you to the private field." />
    </>
  );
}
