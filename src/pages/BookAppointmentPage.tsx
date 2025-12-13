import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingForm } from "@/components/booking-form"

export default function BookAppointmentPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Book Your Appointment
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                Schedule a visit with our experienced healthcare professionals. Choose your preferred doctor, date, and
                time.
              </p>
            </div>
            <BookingForm />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
