import { Footer } from "@/components/chrome";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MenuFeatures, AdminTools, HowItWorks } from "@/components/features";
import { Analytics } from "@/components/analytics";
import { Pricing, FAQ, ClosingCTA } from "@/components/pricing";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MenuFeatures />
        <AdminTools />
        <Analytics />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
