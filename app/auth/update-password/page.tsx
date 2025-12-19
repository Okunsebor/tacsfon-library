'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader, CheckCircle2, ArrowRight } from 'lucide-react';
import AuthLayout from '@/app/components/AuthLayout';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Verify we have a valid session (from the email link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert("Invalid or expired reset link.");
        router.replace('/forgot-password');
      }
    });
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      setLoading(false);
      return;
    }

    // 2. Update the user's password
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      alert("Password updated successfully!");
      router.push('/dashboard'); // Go straight to dashboard
    }
  };

  return (
    <AuthLayout 
      title="Set New Password"
      subtitle="Please create a secure password for your account."
    >
      <form onSubmit={handleUpdate} className="space-y-4">
        
        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="Min. 6 characters" 
              className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Confirm Password</label>
          <div className="relative">
            <CheckCircle2 className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${password && confirmPassword && password === confirmPassword ? 'text-tacsfon-green' : 'text-gray-400'}`} size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="Repeat password" 
              className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#00502b] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
          {loading ? <Loader className="animate-spin" /> : <>Update Password <ArrowRight size={20}/></>}
        </button>
      </form>
    </AuthLayout>
  );
}