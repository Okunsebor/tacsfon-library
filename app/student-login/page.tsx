'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import { Mail, Lock, Loader, ArrowRight } from 'lucide-react';

export default function StudentLogin() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
    if (error) alert(error.message);
  };

  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Sign in to access your saved resources and continue learning."
      isSignUp={false}
    >
      <div className="space-y-6">
        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" required placeholder="Enter your email" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-tacsfon-green focus:ring-2 focus:ring-tacsfon-green/20 transition-all font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-sm font-bold text-tacsfon-green hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" required placeholder="Enter your password" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-tacsfon-green focus:ring-2 focus:ring-tacsfon-green/20 transition-all font-medium" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl hover:bg-[#00502b] transition-all flex items-center justify-center gap-2">
            {loading ? <Loader className="animate-spin" /> : <>Sign in <ArrowRight size={20}/></>}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium">OR</span></div>
        </div>

        <button onClick={handleGoogleSignIn} className="w-full bg-white text-gray-700 font-bold text-lg py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-6 w-6" />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account? <Link href="/register" className="text-tacsfon-green font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </AuthLayout>
  );
}