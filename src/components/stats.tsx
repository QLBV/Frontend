export function Stats() {
  const stats = [
    { value: "25+", label: "Years of Experience" },
    { value: "50K+", label: "Patients Served" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Emergency Care" },
  ]

  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary lg:text-5xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground lg:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
