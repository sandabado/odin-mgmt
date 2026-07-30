"use client";

import { useEffect } from "react";

export interface RecordsSpatialExperienceProps {
  revealSelector?: string;
}

export function RecordsSpatialExperience({
  revealSelector = "[data-records-reveal]",
}: RecordsSpatialExperienceProps) {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    );

    if (
      reducedMotion ||
      targets.length === 0 ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    targets.forEach((target) => {
      target.classList.add("records-reveal--enhanced");
      observer.observe(target);
    });

    return () => {
      observer.disconnect();
      targets.forEach((target) => {
        target.classList.remove("records-reveal--enhanced", "is-visible");
      });
    };
  }, [revealSelector]);

  return null;
}
