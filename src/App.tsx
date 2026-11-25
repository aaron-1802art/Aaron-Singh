import React from "react";
import { Navigation } from "@/components/Navigation/Navigation";
import { Hero } from "@/components/Hero/Hero";
import { WorkBoard } from "@/components/Work/WorkBoard";
import { About } from "@/components/About/About";
import { Contact } from "@/components/Contact/Contact";
import { Footer } from "@/components/Footer/Footer";
import { JsonLd } from "@/components/SEO/JsonLd";
import { InkTrailCanvas } from "@/components/InkTrailCanvas";
import { useHashNavigation } from "@/hooks/useHashNavigation";

export const App: React.FC = () => {
  const { activeSection, navigateTo } = useHashNavigation();

  return (
    <>
      {/* Skip to Content for Screen Readers & Keyboard Nav */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* JSON-LD Schema */}
      <JsonLd />

      {/* Global Brush-Ink Cursor Trail / Tap Splash (below content, above grid) */}
      <InkTrailCanvas />

      {/* Fixed Minimal Navigation */}
      <Navigation activeSection={activeSection} onNavigate={navigateTo} />

      {/* Main Page Landmark */}
      <main id="main-content">
        {/* 1. HERO */}
        <Hero onNavigate={navigateTo} />

        {/* 2. WORK ("THE BOARD") */}
        <WorkBoard />

        {/* 3. ABOUT */}
        <About />

        {/* 4. CONTACT ("SAY HI") */}
        <Contact />
      </main>

      {/* 5. FOOTER */}
      <Footer />
    </>
  );
};

export default App;
