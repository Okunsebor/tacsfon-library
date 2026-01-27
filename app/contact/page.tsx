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

      {/* --- 1. HERO SECTION (Taller & Cleaner) --- */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden pb-32">
        {/* Background Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-[3s]"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop')" }} 
        ></div>
        
        {/* Dark Overlay (Gradient for better text contrast) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-50/90 backdrop-blur-[1px]"></div>

        {/* Hero Text - Centered and Clean */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto -mt-10">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
                Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">Connect.</span>
            </h1>
            <p className="text-gray-100 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
                Have questions about the library, resources, or the fellowship? We are always here for the family.
            </p>
        </div>
      </section>


      {/* --- 2. MAIN CONTENT (Refined Overlap) --- */}
      <section className="relative max-w-7xl mx-auto px-6 pb-20 -mt-32 z-20">
        
        {/* Ambient Background Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT SIDE: INFO CARDS */}
            <div className="space-y-6">
                
                {/* WHATSAPP CARD (Premium Glass Green) */}
                <a 
                  href="https://chat.whatsapp.com/YOUR_ACTUAL_GROUP_LINK_HERE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-8 rounded-[2rem] relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-2xl shadow-green-900/20"
                  style={{
                      background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.9), rgba(20, 180, 80, 0.95))', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                    <div className="absolute -right-6 -top-6 opacity-20 transform rotate-12 group-hover:rotate-45 transition-transform duration-500">
                        <MessageCircle size={120} color="white" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/20 shadow-inner">
                            <MessageCircle size={28} />
                        </div>
                        <h3 className="font-bold text-white text-2xl mb-2 tracking-tight">Join the Family</h3>
                        <p className="text-green-50 text-sm mb-8 font-medium opacity-90 leading-relaxed max-w-[80%]">
                            Connect with us on WhatsApp for daily updates and fellowship.
                        </p>
                        <span className="inline-flex items-center gap-2 bg-white text-[#008f45] px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg group-hover:bg-green-50 transition-colors">
                            Join Group Now →
                        </span>
                    </div>
                </a>

                {/* INFO CARDS (Glass White) */}
                {[
                    { icon: Phone, title: 'Call Us', sub: 'Mon-Fri, 8am-5pm', link: '+234 708 509 5509', href: 'tel:+2347085095509', color: 'text-tacsfon-green', bg: 'bg-green-50' },
                    { icon: Mail, title: 'Email Us', sub: 'We reply within 24hrs', link: 'tacsfonnational@gmail.com', href: 'mailto:tacsfonnational@gmail.com', color: 'text-orange-500', bg: 'bg-orange-50' },
                    { icon: MapPin, title: 'Visit Us', sub: 'Come say hello', link: 'Lagos, Nigeria', href: '#', color: 'text-blue-600', bg: 'bg-blue-50' }
                ].map((item, idx) => (
                    <div key={idx} className="p-6 rounded-[2rem] flex items-center gap-5 hover:-translate-y-1 transition-transform group bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
                        <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} shrink-0 group-hover:scale-110 transition-transform`}>
                            <item.icon size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.title}</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-0.5">{item.sub}</p>
                            <a href={item.href} className={`font-bold text-base md:text-lg hover:underline block truncate ${item.color}`}>
                                {item.link}
                            </a>
                        </div>
                    </div>
                ))}
            </div>


            {/* RIGHT SIDE: GLASS FORM (Clean White) */}
            <div className="lg:col-span-2 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden bg-white border border-gray-100 shadow-2xl shadow-gray-200/50">
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Send a Message</h2>
                    <p className="text-gray-500 font-medium">Fill out the form below and we'll get back to you shortly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Name Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Your Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tacsfon-green transition-colors" size={18} />
                                <input 
                                    type="text" required 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium placeholder:text-gray-400"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tacsfon-green transition-colors" size={18} />
                                <input 
                                    type="email" required 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium placeholder:text-gray-400"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Subject</label>
                            <div className="relative group">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tacsfon-green transition-colors" size={18} />
                                <input 
                                    type="text" required 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium placeholder:text-gray-400"
                                    placeholder="Inquiry about..."
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                />
                            </div>
                        </div>

                         {/* Phone */}
                         <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Phone Number</label>
                            <div className="relative group">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-tacsfon-green transition-colors" size={18} />
                                <input 
                                    type="tel" 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium placeholder:text-gray-400"
                                    placeholder="+234..."
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 tracking-wider">Message</label>
                        <div className="relative group">
                            <MessageSquare className="absolute left-4 top-5 text-gray-400 group-focus-within:text-tacsfon-green transition-colors" size={18} />
                            <textarea 
                                required 
                                className="w-full pl-11 pr-4 py-4 h-40 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium resize-none placeholder:text-gray-400"
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
                        className="w-full md:w-auto bg-tacsfon-green text-white font-bold text-lg px-10 py-4 rounded-xl shadow-[0_10px_30px_rgba(0,168,89,0.4)] hover:shadow-[0_20px_40px_rgba(0,168,89,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Sending...' : <>Send Message <Send size={20}/></>}
                    </button>

                </form>
            </div>

        </div>
      </section>

    </main>
  );
}