"use client";

import { useEffect } from "react";

const SELECTOR = ".reveal, .reveal-group";

/**
 * Page-level observer that animates layout divs, cards, and sections into view.
 * Uses persistent `data-revealed="true"` and a MutationObserver to guarantee that
 * elements NEVER disappear or get stuck when scrolling up and down or when
 * components re-render.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Accessibility: Reduced motion check
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        el.classList.add("is-visible");
        el.setAttribute("data-revealed", "true");
      });
      return;
    }

    document.documentElement.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("is-visible");
            target.setAttribute("data-revealed", "true");
            io.unobserve(target); // Once revealed, stay permanently revealed
          }
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -4% 0px",
      }
    );

    const observePending = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        // If already revealed previously, maintain visibility
        if (el.getAttribute("data-revealed") === "true") {
          el.classList.add("is-visible");
          return;
        }

        // If above the fold / in view initially, reveal immediately without flicker
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("is-visible");
          el.setAttribute("data-revealed", "true");
          return;
        }

        io.observe(el);
      });
    };

    observePending();

    // Watch for dynamically rendered cards/divs (e.g. category filters, search changes)
    const mo = new MutationObserver(() => {
      observePending();
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
