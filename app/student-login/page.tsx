'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight, User, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function StudentLogin() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Check if this student exists in the Database
      const { data: student, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('email', formData.email)
        .eq('full_name', formData.name) // Enforcing they remember their exact name
        .single();

      if (student) {
        // --- SCENARIO A: OLD STUDENT (Found) ---
        // Save to browser and go straight home
        localStorage.setItem('tacsfonStudent', JSON.stringify(student));
        alert(`Welcome back, ${student.full_name}!`);
        router.push('/'); 
      } else {
        // --- SCENARIO B: NEW STUDENT (Not Found) ---
        // Redirect to Onboarding to create account
        // We pass the name/email via URL so they don't have to type it again
        const params = new URLSearchParams({ name: formData.name, email: formData.email });
        router.push(`/student-onboarding?${params.toString()}`);
      }

    } catch (err) {
      console.error('Login error:', err);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row animate-fade-in border border-gray-100">
        
        {/* LEFT SIDE: Visuals (Orange) */}
        <div className="bg-tacsfon-orange w-full md:w-1/2 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 opacity-90">
              <BookOpen size={24} />
              <span className="text-sm font-bold tracking-widest uppercase">Student Access</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">My Library Account</h1>
            <p className="text-orange-100 text-lg">
              Sign in to access your personalized bookshelf and tracking history.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full md:w-1/2 p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">Student Login</h2>
            <p className="text-gray-500">Enter your details to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="student@futminna.edu.ng"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-tacsfon-orange hover:bg-orange-600 text-white font-bold text-lg py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2"
            >
              {loading ? 'Checking...' : (
                <>
                  Access Dashboard <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
             New student? <span className="text-tacsfon-orange font-bold">We will set you up automatically.</span>
          </div>
        </div>
      </div>
    </main>
  );
}