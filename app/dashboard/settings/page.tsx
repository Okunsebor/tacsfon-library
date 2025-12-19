'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, User, Lock, Save, Loader, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    
    // Only proceed if user typed a password
    if (!newPassword) return;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    
    // Update Password for Logged In User
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Password updated successfully!");
      setNewPassword('');
      setConfirmPassword('');
    }
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

          <form onSubmit={handleUpdate} className="space-y-8">
            
            {/* Read Only Email */}
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
              <p className="text-[10px] text-gray-400 mt-2 ml-1">Contact admin to change email.</p>
            </div>

            {/* Change Password Section */}
            <div className="pt-6 border-t border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-tacsfon-green"/> Change Password
              </h2>
              
              <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="New secure password" 
                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Confirm New Password</label>
                    <div className="relative">
                        <CheckCircle2 className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-tacsfon-green' : 'text-gray-400'}`} size={18} />
                        <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Repeat new password" 
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-gray-900" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        />
                    </div>
                  </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || !newPassword} 
                className="w-full bg-gray-900 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? <Loader className="animate-spin" /> : <>Update Password <Save size={18}/></>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}