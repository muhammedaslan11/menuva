import { Footer } from "@/components/chrome";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MenuFeatures, AdminTools, HowItWorks } from "@/components/features";
import { Analytics } from "@/components/analytics";
import { Pricing, FAQ, ClosingCTA } from "@/components/pricing";
import { createServerPB } from "@/lib/pocketbase";
import type { PlanRecord } from "@/lib/types";

async function getActivePlans(): Promise<PlanRecord[]> {
  const pb = createServerPB();
  try {
    return await pb.collection("menuva_plans").getFullList<PlanRecord>({
      filter: "is_active = true",
      sort: "order",
      requestKey: null,
    });
  } catch {
    // PocketBase'e ulaşılamıyorsa Pricing kendi statik yedeğine düşer.
    return [];
  }
}

export default async function Home() {
  const plans = await getActivePlans();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MenuFeatures />
        <AdminTools />
        <Analytics />
        <HowItWorks />
        <Pricing plans={plans} />
        <FAQ />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
}
