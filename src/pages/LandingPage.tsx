import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Services } from "@/components/services"
import { Stats } from "@/components/stats"
import { CTA } from "@/components/cta"
import ContactForm  from "@/components/ContactForm"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <ContactForm/>
      <Footer />
    </main>
  )
}
