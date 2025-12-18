'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import { Mail, Lock, Loader, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function StudentLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- NEW: Visibility State ---
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back"
      subtitle="Sign in to access your library resources."
    >
      <div className="space-y-6">
        <form onSubmit={handleSignIn} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" required placeholder="name@example.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          {/* Password Field with Eye Icon */}
          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Password</label>
              <Link href="/forgot-password" className="text-xs font-bold text-tacsfon-green hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••" 
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              
              {/* Toggle Visibility Button */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#00502b] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader className="animate-spin" /> : <>Sign In <ArrowRight size={20}/></>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here? <Link href="/register" className="text-tacsfon-green font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}