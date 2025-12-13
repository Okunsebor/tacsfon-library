'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Access Denied: Invalid credentials');
    } else {
      router.push('/admin'); // Redirect to Admin Portal on success
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      {/* LOGIN CARD */}
      <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in border border-gray-100">
        
        {/* LEFT SIDE: Visuals (Green) */}
        <div className="bg-tacsfon-green w-full md:w-1/2 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-tacsfon-orange/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 opacity-80">
              <ShieldCheck size={24} />
              <span className="text-sm font-bold tracking-widest uppercase">Secure Access</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-4 leading-tight">Librarian Portal</h1>
            <p className="text-green-100 text-lg">
              Manage the TACSFON digital archive, organize collections, and respond to student inquiries.
            </p>
          </div>

          <div className="relative z-10 text-sm text-green-200 mt-12">
            &copy; 2025 TACSFON National Library System.
            <br />Authorized Personnel Only.
          </div>
        </div>

        {/* RIGHT SIDE: Form (White) */}
        <div className="w-full md:w-1/2 p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500">Please sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  placeholder="librarian@tacsfon.org"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-tacsfon-orange hover:bg-orange-600 text-white font-bold text-lg py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Verifying...' : (
                <>
                  Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Forgot your credentials? Contact the <span className="text-tacsfon-green font-bold cursor-pointer hover:underline">National IT Directorate</span>.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}