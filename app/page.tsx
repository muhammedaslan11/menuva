import { Navbar, Footer } from "@/components/chrome";
import { Hero } from "@/components/hero";
import { MenuFeatures, AdminTools, HowItWorks } from "@/components/features";
import { Pricing, FAQ, ClosingCTA } from "@/components/pricing";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MenuFeatures />
        <AdminTools />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
