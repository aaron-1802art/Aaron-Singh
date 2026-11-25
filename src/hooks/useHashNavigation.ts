import { useState, useEffect, useCallback } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export type SectionId = "work" | "about" | "contact";

const SECTION_IDS: SectionId[] = ["work", "about", "contact"];

function getNavHeight(): number {
  if (typeof window === "undefined") return 60;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--nav-height")
    .trim();
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 60;
}

export function useHashNavigation() {
  const prefersReduced = usePrefersReducedMotion();
  const [activeSection, setActiveSection] = useState<SectionId | null>(() => {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash.replace("#", "") as SectionId;
    return SECTION_IDS.includes(hash) ? hash : null;
  });

  const scrollToSection = useCallback(
    (id: SectionId, instant = false) => {
      const target = document.getElementById(id);
      if (!target) return;

      const navHeight = getNavHeight();
      const top =
        target.getBoundingClientRect().top + window.scrollY - navHeight + 2;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: instant || prefersReduced ? "auto" : "smooth",
      });
    },
    [prefersReduced]
  );

  // Handle initial page load: scroll to hash if present, otherwise enforce top=0
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const initialHash = window.location.hash.replace("#", "") as SectionId;

    const handleInitialPosition = () => {
      if (SECTION_IDS.includes(initialHash)) {
        setActiveSection(initialHash);
        // Wait two frames + fonts ready so layout positions are settled
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToSection(initialHash, prefersReduced);
          });
        });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(handleInitialPosition).catch(handleInitialPosition);
    } else {
      handleInitialPosition();
    }
  }, [prefersReduced, scrollToSection]);

  // Listen to browser back/forward or manual hashchange
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "") as SectionId;
      if (SECTION_IDS.includes(hash)) {
        setActiveSection(hash);
        scrollToSection(hash, false);
      } else if (!window.location.hash) {
        setActiveSection(null);
        window.scrollTo({
          top: 0,
          behavior: prefersReduced ? "auto" : "smooth",
        });
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [prefersReduced, scrollToSection]);

  // Observe visible sections to keep active nav pill highlighted during manual scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as SectionId;
            if (SECTION_IDS.includes(id)) {
              setActiveSection(id);
            }
          }
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: 0,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onScrollTopCheck = () => {
      if (window.scrollY < 180) {
        setActiveSection(null);
      }
    };
    window.addEventListener("scroll", onScrollTopCheck, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScrollTopCheck);
    };
  }, []);

  const navigateTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
      e.preventDefault();
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, "", `#${id}`);
      }
      setActiveSection(id);
      scrollToSection(id, false);
    },
    [scrollToSection]
  );

  return {
    activeSection,
    navigateTo,
  };
}

