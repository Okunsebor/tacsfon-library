'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import { Mail, Lock, Loader, ArrowRight, KeyRound } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      setStep('verify');
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Verify the code
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // --- UPDATE HERE: Redirect to Dashboard ---
      if (data.session) {
        router.push('/dashboard'); 
      } else {
        // Fallback: If for some reason session isn't active, try signing in with the password we already have
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) router.push('/dashboard');
      }
    }
  };

  return (
    <AuthLayout 
      title={step === 'details' ? "Create Account" : "Verify Email"}
      subtitle={step === 'details' ? "Join the community of intellectuals." : `Enter the code sent to ${email}`}
    >
      {step === 'details' ? (
        // --- STEP 1: DETAILS ---
        <div className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" required placeholder="name@example.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" required placeholder="Create a password" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#00502b] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" /> : <>Continue <ArrowRight size={20}/></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href="/student-login" className="text-tacsfon-green font-bold hover:underline">Log in</Link>
          </p>
        </div>
      ) : (
        // --- STEP 2: VERIFICATION ---
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 text-center">Verification Code</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                required 
                placeholder="000000" 
                maxLength={8}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-2xl tracking-[0.5em] text-center text-gray-900" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#00502b] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader className="animate-spin" /> : <>Verify & Access <ArrowRight size={20}/></>}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}