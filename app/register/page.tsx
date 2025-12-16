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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` } // Important for magic links
    });
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
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/student-login');
      alert('Email verified successfully! Please sign in.');
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
    if (error) alert(error.message);
  };

  return (
    <AuthLayout 
      title={step === 'details' ? "Create your account" : "Verify your email"}
      subtitle={step === 'details' ? "Start your journey with the TACSFON Library." : `We've sent a code to ${email}`}
      currentStep={step}
      isSignUp={true}
    >
      {step === 'details' ? (
        // --- STEP 1: YOUR DETAILS FORM ---
        <div className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" required placeholder="Enter your email" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-tacsfon-green focus:ring-2 focus:ring-tacsfon-green/20 transition-all font-medium" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" required placeholder="Create a password" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-tacsfon-green focus:ring-2 focus:ring-tacsfon-green/20 transition-all font-medium" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl hover:bg-[#00502b] transition-all flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" /> : <>Continue <ArrowRight size={20}/></>}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium">OR</span></div>
          </div>

          <button onClick={handleGoogleSignUp} className="w-full bg-white text-gray-700 font-bold text-lg py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-6 w-6" />
            Sign up with Google
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account? <Link href="/student-login" className="text-tacsfon-green font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      ) : (
        // --- STEP 2: VERIFY EMAIL FORM ---
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Verification Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" required placeholder="Enter the 6-digit code" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-tacsfon-green focus:ring-2 focus:ring-tacsfon-green/20 transition-all font-medium tracking-widest" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl hover:bg-[#00502b] transition-all flex items-center justify-center gap-2">
            {loading ? <Loader className="animate-spin" /> : <>Verify Email <ArrowRight size={20}/></>}
          </button>
          <button type="button" onClick={() => setStep('details')} className="w-full text-gray-500 font-bold text-sm hover:text-tacsfon-green transition-colors">
            ← Back to details
          </button>
        </form>
      )}
    </AuthLayout>
  );
}