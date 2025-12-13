import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock, Heart, Shield, Stethoscope, Users } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Stethoscope,
      title: "Primary Care",
      description:
        "Comprehensive primary care services for patients of all ages, from preventive care to chronic disease management.",
    },
    {
      icon: Heart,
      title: "Specialized Care",
      description:
        "Access to board-certified specialists across multiple disciplines to address your specific health needs.",
    },
    {
      icon: Clock,
      title: "Convenient Hours",
      description:
        "Extended hours including evenings and weekends to fit your busy schedule. Same-day appointments available.",
    },
    {
      icon: Shield,
      title: "Insurance Partners",
      description: "We work with most major insurance providers to make quality healthcare accessible and affordable.",
    },
    {
      icon: Activity,
      title: "Advanced Technology",
      description:
        "State-of-the-art medical equipment and electronic health records for accurate diagnosis and treatment.",
    },
    {
      icon: Users,
      title: "Family Medicine",
      description: "Continuity of care for the whole family with providers who understand your unique health history.",
    },
  ]

  return (
    <section id="services" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold lg:text-4xl">Comprehensive Healthcare Services</h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg text-muted-foreground">
            From routine checkups to specialized treatments, we provide the full spectrum of healthcare services to keep
            you and your family healthy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
