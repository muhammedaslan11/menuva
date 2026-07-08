"use client";

import { useEffect } from "react";

// [data-reveal] işaretli öğeleri görünür olduklarında .revealed sınıfıyla
// yumuşakça içeri alır (CSS: globals.css). Client navigasyonla sonradan
// eklenen öğeleri MutationObserver ile yakalar; bir kez görünen öğe bir
// daha animasyon almaz. prefers-reduced-motion CSS tarafında ele alınır.
export function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    const seen = new WeakSet<Element>();
    function scan() {
      document.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    }

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
