import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Services() {
  const services = [
    {
      title: "Preventive Care",
      image: "/preventive-healthcare-checkup-medical-examination.jpg",
      description: "Annual physicals, vaccinations, and health screenings to keep you healthy.",
      items: ["Annual Wellness Visits", "Immunizations", "Cancer Screenings", "Health Risk Assessments"],
    },
    {
      title: "Urgent Care",
      image: "/urgent-care-medical-emergency-treatment.jpg",
      description: "Walk-in care for non-life-threatening conditions when you need it most.",
      items: ["Minor Injuries", "Infections", "Flu & Cold", "Lab Tests & X-rays"],
    },
    {
      title: "Chronic Disease Management",
      image: "/chronic-disease-management-diabetes-healthcare.jpg",
      description: "Ongoing care and support for managing chronic health conditions.",
      items: ["Diabetes Care", "Hypertension", "Asthma", "Heart Disease"],
    },
  ]

  return (
    <section className="bg-muted/30 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold lg:text-4xl">Our Medical Services</h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            We offer a wide range of medical services designed to meet all your healthcare needs in one convenient
            location.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="mb-3 text-2xl font-bold">{service.title}</h3>
                <p className="mb-4 text-muted-foreground">{service.description}</p>
                <ul className="mb-6 space-y-2">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="gap-2 p-0">
                  Tìm hiểu thêm
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
