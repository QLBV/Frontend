import { Button } from "@/components/ui/button"
import { Calendar, Phone } from "lucide-react"
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted/50 to-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight lg:text-6xl">
              Your Health, Our Priority
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground lg:text-xl">
              Experience compassionate, comprehensive healthcare from board-certified providers. We're here to support
              your wellness journey every step of the way.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/book-appointment">
                  <Calendar className="h-5 w-5" />
                  Schedule Appointment
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <Phone className="h-5 w-5" />
                (555) 123-4567
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Same-day appointments
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Most insurance accepted
              </div>
            </div>
          </div>
          <div className="relative lg:h-150">
            <div className="absolute inset-0 overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 to-secondary/10">
              <img
                src="/professional-healthcare-doctor-with-patient-in-mod.jpg"
                alt="Healthcare professional with patient"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
