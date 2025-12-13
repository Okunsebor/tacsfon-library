'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Send data to Supabase
    const { error } = await supabase
      .from('contact_messages')
      .insert([formData]);

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } else {
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-20 px-4">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
        <span className="text-tacsfon-orange font-bold tracking-widest text-xs uppercase mb-3 block">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-tacsfon-green mb-4">
          We'd Love to Hear from You
        </h1>
        <p className="text-gray-500 text-lg">
          Have a question about a book, a resource request, or just want to say hello? Send us a message and our librarians will get back to you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
        
        {/* LEFT COLUMN: CONTACT INFO (Green Card) */}
        <div className="bg-tacsfon-green text-white p-10 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div>
            <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 text-tacsfon-orange" />
                <p className="leading-relaxed text-green-100">
                  Federal University of Technology, Minna<br />
                  Gidan Kwano Campus<br />
                  Niger State, Nigeria
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-tacsfon-orange" />
                <p className="text-green-100">+234 800 123 4567</p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-tacsfon-orange" />
                <p className="text-green-100">library@tacsfon.org</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-sm text-green-200 uppercase tracking-widest font-semibold mb-4">Follow Us</p>
            <div className="flex gap-4">
              {/* Social Placeholders */}
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 hover:bg-tacsfon-orange transition-colors cursor-pointer flex items-center justify-center">
                  <span className="text-xs">social</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE FORM (White Card) */}
        <div className="md:col-span-2 bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4 animate-fade-in">
              <CheckCircle size={64} className="text-tacsfon-green" />
              <h3 className="text-2xl font-bold text-gray-800">Message Sent!</h3>
              <p className="text-gray-500">Thank you for reaching out. Our librarian will review your message shortly.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-4 text-tacsfon-orange font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green focus:ring-2 focus:ring-green-100 outline-none transition-all"
                    placeholder="Student Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    type="email" 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green focus:ring-2 focus:ring-green-100 outline-none transition-all"
                    placeholder="student@futminna.edu.ng"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Subject</label>
                <input 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  placeholder="Requesting a book..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Message</label>
                <textarea 
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-tacsfon-orange hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message <Send size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}