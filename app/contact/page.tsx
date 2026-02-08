'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import { MapPin, Phone, Mail, Send, User, Type, MessageSquare, Smartphone, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('contact_messages').insert([formData]);

    if (error) {
      alert('Error sending message: ' + error.message);
    } else {
      alert('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); 
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans selection:bg-tacsfon-green selection:text-white">
      <Navbar />

      {/* --- 1. HERO SECTION (Mobile Optimized) --- */}
      {/* Reduced height on mobile (min-h-[400px]) so content appears faster */}
      <section className="relative h-[50vh] min-h-[400px] md:h-[60vh] md:min-h-[500px] flex items-center justify-center overflow-hidden pb-20 md:pb-32">
        
        {/* Background Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-[3s]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop')" }} 
        ></div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-50/90 backdrop-blur-[1px]"></div>

        {/* Hero Text - Compact on Mobile */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12 md:-mt-10">
            <h1 className="text-4xl md:text-7xl font-black text-white mb-3 md:mb-6 tracking-tight drop-shadow-lg">
                Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">Connect.</span>
            </h1>
            <p className="text-gray-100 text-base md:text-2xl max-w-xl mx-auto leading-relaxed font-light drop-shadow-md">
                Have questions about the library, resources, or the fellowship? We are here for the family.
            </p>
        </div>
      </section>


      {/* --- 2. MAIN CONTENT (Refined Overlap for Mobile) --- */}
      {/* Reduced negative margin (-mt-20) on mobile so it doesn't cover the title */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20 -mt-20 md:-mt-32 z-20">
        
        {/* Ambient Blobs */}
        <div className="absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

            {/* LEFT SIDE: INFO CARDS */}
            <div className="space-y-4 md:space-y-6">
                
                {/* WHATSAPP CARD (Compact Mobile Padding) */}
                <a 
                  href="https://chat.whatsapp.com/F0mi4PCyOPiKpPMxFjInOh?mode=gi_t" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-6 md:p-8 rounded-3xl md:rounded-[2rem] relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl md:shadow-2xl shadow-green-900/20"
                  style={{
                      background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.9), rgba(20, 180, 80, 0.95))', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                    <div className="absolute -right-6 -top-6 opacity-20 transform rotate-12 group-hover:rotate-45 transition-transform duration-500">
                        <MessageCircle size={100} color="white" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 backdrop-blur-md border border-white/20 shadow-inner">
                            <MessageCircle size={24} className="md:w-7 md:h-7" />
                        </div>
                        <h3 className="font-bold text-white text-xl md:text-2xl mb-2 tracking-tight">Join the Family</h3>
                        <p className="text-green-50 text-sm mb-6 md:mb-8 font-medium opacity-90 leading-relaxed max-w-[90%]">
                            Connect with us on WhatsApp for daily updates.
                        </p>
                        <span className="inline-flex items-center gap-2 bg-white text-[#008f45] px-5 py-3 md:px-6 md:py-3.5 rounded-xl font-bold text-xs md:text-sm shadow-lg group-hover:bg-green-50 transition-colors">
                            Join Group Now →
                        </span>
                    </div>
                </a>

                {/* INFO CARDS (Compact List) */}
                <div className="grid grid-cols-1 gap-3 md:gap-6">
                  {[
                      { icon: Phone, title: 'Call Us', sub: 'Mon-Fri, 8am-5pm', link: '+234 70 1989 0988', href: 'tel:+2347019890988', color: 'text-tacsfon-green', bg: 'bg-green-50' },
                      { icon: Mail, title: 'Email Us', sub: 'We reply within 24hrs', link: 'tacsfonfutminna@gmail.com', href: 'mailto:tacsfonfutminna@gmail.com', color: 'text-orange-500', bg: 'bg-orange-50' },
                      { icon: MapPin, title: 'Visit Us', sub: 'Lagos, Nigeria', link: 'Come say hello', href: '#', color: 'text-blue-600', bg: 'bg-blue-50' }
                  ].map((item, idx) => (
                      <div key={idx} className="p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex items-center gap-4 hover:-translate-y-1 transition-transform group bg-white border border-gray-100 shadow-lg shadow-gray-200/50">
                          <div className={`w-10 h-10 md:w-14 md:h-14 ${item.bg} rounded-xl md:rounded-2xl flex items-center justify-center ${item.color} shrink-0`}>
                              <item.icon size={20} className="md:w-6 md:h-6" />
                          </div>
                          <div className="overflow-hidden">
                              <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight">{item.title}</h3>
                              <a href={item.href} className={`font-bold text-sm md:text-lg hover:underline block truncate ${item.color}`}>
                                  {item.link}
                              </a>
                          </div>
                      </div>
                  ))}
                </div>
            </div>


            {/* RIGHT SIDE: FORM (Compact Padding) */}
            <div className="lg:col-span-2 rounded-3xl md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden bg-white border border-gray-100 shadow-xl md:shadow-2xl shadow-gray-200/50">
                <div className="mb-6 md:mb-10 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Send a Message</h2>
                    <p className="text-gray-500 text-sm md:text-base font-medium">Fill out the form below and we'll get back to you.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        
                        {/* Name Input */}
                        <div>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" required 
                                    className="w-full pl-11 pr-4 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-sm md:text-base placeholder:text-gray-400"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="email" required 
                                    className="w-full pl-11 pr-4 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-sm md:text-base placeholder:text-gray-400"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Subject */}
                        <div>
                            <div className="relative group">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" required 
                                    className="w-full pl-11 pr-4 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-sm md:text-base placeholder:text-gray-400"
                                    placeholder="Subject"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                />
                            </div>
                        </div>

                         {/* Phone */}
                         <div>
                            <div className="relative group">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="tel" 
                                    className="w-full pl-11 pr-4 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-sm md:text-base placeholder:text-gray-400"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <div className="relative group">
                            <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                            <textarea 
                                required 
                                className="w-full pl-11 pr-4 py-3 md:py-4 h-32 md:h-40 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-sm md:text-base resize-none placeholder:text-gray-400"
                                placeholder="How can we help you?"
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                            ></textarea>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full md:w-auto bg-tacsfon-green text-white font-bold text-base md:text-lg px-8 py-3.5 md:px-10 md:py-4 rounded-xl shadow-[0_10px_30px_rgba(0,168,89,0.4)] hover:shadow-[0_20px_40px_rgba(0,168,89,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Sending...' : <>Send Message <Send size={18} className="md:w-5 md:h-5"/></>}
                    </button>

                </form>
            </div>

        </div>
      </section>

    </main>
  );
}