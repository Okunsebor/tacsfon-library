'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import { MapPin, Phone, Mail, Send, User, Type, MessageSquare, Smartphone } from 'lucide-react';

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

    // CORRECTED: Sending to your existing 'contact_messages' table
    const { error } = await supabase.from('contact_messages').insert([formData]);

    if (error) {
      alert('Error sending message: ' + error.message);
    } else {
      alert('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); // Reset form
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-tacsfon-dark text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                Have questions about the library, resources, or the fellowship? We are here to help.
            </p>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="max-w-7xl mx-auto px-6 py-16 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT SIDE: CONTACT INFO CARDS */}
            <div className="space-y-6">
                
                {/* Phone Card */}
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-start gap-5 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-tacsfon-green shrink-0">
                        <Phone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Call Us</h3>
                        <p className="text-gray-500 text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
                        <a href="tel:+2347085095509" className="text-tacsfon-green font-bold text-lg hover:underline">+234 708 509 5509</a>
                    </div>
                </div>

                {/* Email Card */}
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-start gap-5 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-tacsfon-orange shrink-0">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Email Us</h3>
                        <p className="text-gray-500 text-sm mb-2">Our friendly team is here to help.</p>
                        <a href="mailto:tacsfonnational@gmail.com" className="text-tacsfon-orange font-bold text-lg hover:underline block truncate max-w-[200px]">tacsfonnational@gmail.com</a>
                    </div>
                </div>

                {/* Address Card */}
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex items-start gap-5 hover:-translate-y-1 transition-transform">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Visit Us</h3>
                        <p className="text-gray-500 text-sm mb-2">Come say hello at our office.</p>
                        <p className="text-gray-800 font-bold">Lagos, Nigeria</p>
                    </div>
                </div>

            </div>

            {/* RIGHT SIDE: THE "GET IN TOUCH" FORM */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Interested in discussing?</h2>
                    <p className="text-gray-500">Fill out the form below and we'll get back to you shortly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Your Name <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" required 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Email Address <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="email" required 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
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
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Subject <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" required 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                                    placeholder="Inquiry about..."
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                />
                            </div>
                        </div>

                         {/* Phone */}
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="tel" 
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
                                    placeholder="+234..."
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Message <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-5 text-gray-400" size={18} />
                            <textarea 
                                required 
                                className="w-full pl-11 pr-4 py-4 h-40 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium resize-none"
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
                        className="bg-tacsfon-green text-white font-bold text-lg px-10 py-4 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#00502b] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
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