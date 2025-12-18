'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';
import { Mail, Lock, Loader, ArrowRight, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      setLoading(false);
      return;
    }

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
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      if (data.session) {
        router.push('/dashboard'); 
      } else {
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
        // --- STEP 1: DETAILS FORM ---
        <div className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" required placeholder="name@example.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="Create a password" 
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Confirm Password</label>
              <div className="relative">
                <CheckCircle2 className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${password && confirmPassword && password === confirmPassword ? 'text-tacsfon-green' : 'text-gray-400'}`} size={18} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  placeholder="Confirm your password" 
                  className={`w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-4 transition-all font-medium text-gray-900 ${password && confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-tacsfon-green focus:ring-green-500/10'}`} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                {/* Toggle Visibility Button */}
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#00502b] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader className="animate-spin" /> : <>Sign Up <ArrowRight size={20}/></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account? <Link href="/student-login" className="text-tacsfon-green font-bold hover:underline">Log in</Link>
          </p>

          {/* --- QUOTE SECTION --- */}
          <div className="pt-6 mt-6 border-t border-gray-100">
             <blockquote className="text-center italic text-gray-400 text-sm font-serif">
                "Wisdom is the principal thing; therefore get wisdom."
             </blockquote>
             <p className="text-center text-xs text-gray-300 mt-2 uppercase tracking-widest font-bold">— Proverbs 4:7</p>
          </div>

        </div>
      ) : (
        // --- STEP 2: VERIFICATION FORM ---
        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 text-center">Verification Code</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                required 
                placeholder="******" 
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