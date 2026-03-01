import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Qualifications } from "@/components/sections/Qualifications";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { ImpactBand } from "@/components/sections/ImpactBand";
import { CertMarquee } from "@/components/sections/CertMarquee";
import { FloatingContact } from "@/components/sections/FloatingContact";
import { SkillFlowGraphic } from "@/components/sections/SkillFlowGraphic";
import { FrameworksBand } from "@/components/sections/FrameworksBand";

export default function Home() {
  return (
    <main style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <CertMarquee />
      <About />
      <ImpactBand />
      <FrameworksBand />
      <SkillFlowGraphic />
      <Skills />
      <Qualifications />
      <Experience />
      <Contact />
      <Footer />
      <FloatingContact />
    </main>
  );
}
