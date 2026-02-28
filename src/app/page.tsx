import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Qualifications } from "@/components/sections/Qualifications";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main style={{ background: "#060810", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Qualifications />
      <Contact />
      <Footer />
    </main>
  );
}
