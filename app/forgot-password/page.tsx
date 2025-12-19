'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, ArrowRight, ArrowLeft, Loader, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import AuthLayout from '@/app/components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Trigger Supabase Password Reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Password"
      subtitle="Enter your email to receive recovery instructions."
    >
      {success ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
          <p className="text-gray-500">
            We have sent a password recovery link to <span className="font-bold text-gray-900">{email}</span>.
          </p>
          <Link href="/student-login" className="block w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
            Back to Login
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#00502b] hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" /> : <>Send Link <ArrowRight size={20}/></>}
            </button>
          </form>

          <div className="text-center">
             <Link href="/student-login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={16} /> Back to Login
             </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}