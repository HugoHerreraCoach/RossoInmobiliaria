"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MotionExperience() {
  const path = usePathname();
  const [reduced, setReduced] = useState(false);
  const excluded = path.startsWith("/panel") || path.startsWith("/privacidad");

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const run = !reduced && !excluded;
    document.documentElement.dataset.motion = run ? "running" : "paused";
    window.dispatchEvent(new CustomEvent("rosso:motion", { detail: run }));
    if (!run) return;

    const elements = [...document.querySelectorAll<HTMLElement>(".editorial-heading,.intro-grid__visual,.intro-grid__copy,.amenity-item,.facts-band__grid>div,.location-grid__copy,.location-grid__visual,.purchase-steps>div,.contact-section__copy,.contact-section__form,.finance-highlight")];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: "0px 0px -25px 0px" });

    elements.forEach((el, i) => {
      el.dataset.reveal = "";
      el.style.setProperty("--reveal-delay", `${(i % 3) * 75}ms`);
      observer.observe(el);
    });

    let raf = 0;
    const render = () => {
      raf = 0;
      const height = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty("--reading-progress", `${height > 0 ? Math.max(0, Math.min(1, scrollY / height)) : 0}`);
      document.documentElement.style.setProperty("--hero-shift", `${Math.min(scrollY * 0.11, 75)}px`);
    };

    const scroll = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    render();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      cancelAnimationFrame(raf);
      elements.forEach(el => {
        delete el.dataset.reveal;
        delete el.dataset.visible;
      });
    };
  }, [path, reduced, excluded]);

  if (excluded) return null;
  return <div className="reading-progress" aria-hidden="true" />;
}

