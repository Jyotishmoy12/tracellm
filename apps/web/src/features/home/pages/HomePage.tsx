import { BeforeAfterSection } from "../components/BeforeAfterSection.js";
import { FinalCta } from "../components/FinalCta.js";
import { HomeFooter } from "../components/HomeFooter.js";
import { HomeHeader } from "../components/HomeHeader.js";
import { HomeHero } from "../components/HomeHero.js";
import { LiveDebugSection } from "../components/LiveDebugSection.js";
import { ProductShowcase } from "../components/ProductShowcase.js";

export function HomePage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-black" aria-label="TraceLLM home">
      <HomeHeader />
      <HomeHero />
      <ProductShowcase />
      <BeforeAfterSection />
      <LiveDebugSection />
      <FinalCta />
      <HomeFooter />
    </main>
  );
}
