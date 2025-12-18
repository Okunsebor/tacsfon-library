'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, User, Lock, Save, Loader } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/student-login');
      } else {
        setEmail(session.user.email || '');
      }
    }
    getUser();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Logic to update profile would go here
    alert("Profile update feature coming soon!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-tacsfon-green font-bold mb-8 transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100 border border-gray-100">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Account Settings</h1>

          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Email (Read Only) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  disabled 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed" 
                  value={email} 
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">You cannot change your email address.</p>
            </div>

            {/* Password Reset Request */}
            <div className="pt-6 border-t border-gray-100">
              <h2 className="font-bold text-gray-900 mb-2">Security</h2>
              <button type="button" onClick={() => router.push('/forgot-password')} className="flex items-center gap-2 text-tacsfon-green font-bold hover:underline">
                <Lock size={16} /> Reset Password
              </button>
            </div>

            {/* Save Button (Placeholder) */}
            <div className="pt-6">
              <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2">
                {loading ? <Loader className="animate-spin" /> : <>Save Changes <Save size={18}/></>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}