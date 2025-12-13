import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 lg:p-16">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold text-primary-foreground lg:text-4xl">
              Ready to Take Control of Your Health?
            </h2>
            <p className="mb-8 text-pretty text-lg text-primary-foreground/90 lg:text-xl">
              Schedule your appointment today and experience the difference of personalized, compassionate healthcare.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <Link to="/book-appointment">
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                Contact Us
              </Button>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/10" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/10" />
        </div>
      </div>
    </section>
  )
}
