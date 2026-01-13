import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-20 lg:pt-20 lg:pb-32">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 -z-10 w-[50%] h-[70vh] bg-gradient-to-bl from-blue-50/80 to-transparent rounded-bl-[100px] blur-3xl opacity-60"></div>
       <div className="absolute bottom-0 left-0 -z-10 w-[30%] h-[50vh] bg-gradient-to-tr from-cyan-50/80 to-transparent rounded-tr-[100px] blur-3xl opacity-60"></div>

      <div className="container mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col justify-center animate-in slide-in-from-left-5 duration-700 fade-in">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 mb-6 border border-blue-100 uppercase tracking-widest">
               TRUSTED MEDICAL CENTER
            </div>
            
            <h1 className="mb-6 text-balance text-5xl font-extrabold tracking-tight text-gray-900 lg:text-6xl lg:leading-[1.15]">
              Chăm sóc sức khỏe <br/>
              toàn diện cho gia <br/>
              đình bạn
            </h1>
            
            <p className="mb-8 text-pretty text-lg text-gray-500 lg:text-xl max-w-lg leading-relaxed">
              Đội ngũ chuyên gia hàng đầu, trang thiết bị hiện đại. Mang đến sự an tâm và sức khỏe bền vững cho cộng đồng.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 font-semibold text-base transition-all hover:scale-105" asChild>
                <Link to="/patient/book-appointment">
                  Đặt lịch khám ngay
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-lg border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base transition-all" asChild>
                 <a href="#services">
                  Xem chuyên khoa
                 </a>
              </Button>
            </div>
          </div>

          <div className="relative lg:h-[600px] w-full animate-in slide-in-from-right-5 duration-700 fade-in delay-200">
            <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2653&auto=format&fit=crop"
                alt="Hospital Interior"
                className="h-full w-full object-cover"
              />
              
              {/* Floating Card */}
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 max-w-sm animate-in fade-in slide-in-from-bottom-5 delay-500 duration-700 flex items-center gap-4">
                 <div className="bg-blue-600 p-2.5 rounded-lg text-white">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900 text-sm">Làm việc 24/7</h4>
                    <p className="text-xs text-gray-500">Luôn sẵn sàng phục vụ bạn mọi lúc</p>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
