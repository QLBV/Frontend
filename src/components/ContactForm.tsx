import React from 'react';
import { MapPin, Phone, Mail, Map as MapIcon } from 'lucide-react';

const ContactForm = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 font-sans">
      <div className="flex flex-col lg:flex-row bg-card rounded-[20px] shadow-xl overflow-hidden border border-border/50">
        
        {/* === Left Section: Contact Info (Blue) === */}
        <div className="w-full lg:w-5/12 bg-primary text-primary-foreground p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          
          {/* Content */}
          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-primary-foreground/90 leading-relaxed">
                Have questions or need assistance? Fill out the form or visit us directly.
              </p>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Location</h3>
                  <p className="text-primary-foreground/80 text-sm mt-1 leading-relaxed">
                    Hàn Thuyên, khu phố 6 P, Thủ Đức,<br />
                    Thành phố Hồ Chí Minh
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Phone</h3>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    Main: (212) 555-0123<br />
                    Emergency: 911
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Email</h3>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    contact@citygeneral.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* === Map Section === */}
          <div className="mt-12 relative z-10">
            <div className="h-48 w-full rounded-xl overflow-hidden relative bg-blue-900/20 border border-white/20 group">
              
              {/* Google Map Iframe */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5599.958363299317!2d106.79855026986118!3d10.87223801524219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgVGjDtG5nIHRpbiAtIMSQSFFHIFRQLkhDTQ!5e1!3m2!1svi!2s!4v1765772058522!5m2!1svi!2s"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
              />

              {/* Overlay Button - Opens Full Map in New Tab */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                 <a 
                   href="https://maps.google.com/?q=Hàn+Thuyên,+khu+phố+6+P,+Thủ+Đức,+Thành+phố+Hồ+Chí+Minh" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg hover:scale-105"
                 >
                    <MapIcon size={16} />
                    View on Map
                 </a>
              </div>
              
            </div>
          </div>
          
          {/* Decorative Circle (Optional visual flair) */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        </div>

        {/* === Right Section: Form (White) === */}
        <div className="w-full lg:w-7/12 bg-card p-8 md:p-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">Request a Call Back</h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">First Name</label>
                <input 
                  type="text" 
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
              
              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-input bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Phone Number</label>
              <input 
                type="tel" 
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3 rounded-xl border border-input bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Department</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-input bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none text-foreground cursor-pointer">
                  <option>General Inquiry</option>
                  <option>Cardiology</option>
                  <option>Pediatrics</option>
                  <option>Emergency</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Message</label>
              <textarea 
                rows={4}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 rounded-xl border border-input bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 mt-2 active:scale-[0.99]"
            >
              Submit Request
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactForm;