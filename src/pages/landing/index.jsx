import React from "react";
import LandingStyle from "./LandingStyle";
import NavBar from "./sections/NavBar";
import Hero from "./sections/Hero";
import StatsMarquee from "./sections/StatsMarquee";
import FeatureShowcase from "./sections/FeatureShowcase";
import ThemeGallery from "./sections/ThemeGallery";
import TrustSection from "./sections/TrustSection";
import FaqSection from "./sections/FaqSection";
import ClosingCta from "./sections/ClosingCta";
import Footer from "./sections/Footer";

/*
 * The "front door" of StudyBun — a full marketing/showcase page a visitor
 * lands on before ever seeing a sign-in form. The idea: let them explore
 * what the app actually does first, and only ask for an account once
 * they've decided they want in. `onGetStarted` is called from every CTA
 * on this page and hands control back to AppRoot, which swaps this out
 * for the actual Auth screen.
 */
export default function Landing({ onGetStarted }) {
  return (
    <div className="sb-land-page">
      <LandingStyle />
      <NavBar onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <StatsMarquee />
      <FeatureShowcase />
      <ThemeGallery />
      <TrustSection />
      <FaqSection />
      <ClosingCta onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
