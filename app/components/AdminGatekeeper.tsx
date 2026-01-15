'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Lock, ArrowRight, Loader, ShieldAlert, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminGatekeeper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // States
  const [isAuthorized, setIsAuthorized] = useState(false); // Can they see the dashboard?
  const [isEmailAllowed, setIsEmailAllowed] = useState(false); // Is the email correct?
  const [checkingEmail, setCheckingEmail] = useState(true); // Are we still fetching DB?
  
  const [passkeyInput, setPasskeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkIdentity() {
      // 1. Get Current User
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Login check handled by parent page
      
      const userEmail = session.user.email;

      // 2. Get Allowed Admin Email from Supabase
      const { data: setting } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_email')
        .single();

      if (setting && setting.setting_value === userEmail) {
         // EMAIL MATCHES! Now check if they already unlocked the passkey previously.
         setIsEmailAllowed(true);
         const sessionKey = sessionStorage.getItem('tacsfon_admin_unlocked');
         if (sessionKey === 'true') setIsAuthorized(true);
      } else {
         // EMAIL DOES NOT MATCH
         setIsEmailAllowed(false);
      }
      setCheckingEmail(false);
    }
    checkIdentity();
  }, []);

  const verifyPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch the Passkey from DB
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_passkey') // <--- Checks the password
        .single();

      if (!data) throw new Error("System error: Passkey not found.");

      if (passkeyInput === data.setting_value) {
        sessionStorage.setItem('tacsfon_admin_unlocked', 'true');
        setIsAuthorized(true);
      } else {
        setError("Incorrect Passkey. Access Denied.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING LOGIC ---

  // 1. Still Checking Database?
  if (checkingEmail) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <Loader className="animate-spin mr-2"/> Verifying Identity...
        </div>
    );
  }

  // 2. Email Mismatch? (BLOCK THEM)
  if (!isEmailAllowed) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border border-red-100">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized Access</h1>
                <p className="text-gray-500 mb-6">
                    You are logged in, but your email address is not authorized to access the Librarian Desk.
                </p>
                <button onClick={() => router.push('/')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all">
                    Return to Library
                </button>
            </div>
        </div>
      );
  }

  // 3. Email Correct but Passkey Needed? (SHOW LOCK SCREEN)
  if (!isAuthorized) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Lock className="text-tacsfon-green" size={32} />
            </div>
            
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Librarian Access Only</h1>
            <p className="text-gray-500 mb-8">Identity Verified. Please enter the master passkey.</p>
    
            <form onSubmit={verifyPasskey} className="space-y-4">
                <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Enter Passkey" 
                      className="w-full pl-6 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green focus:ring-4 focus:ring-green-500/10 font-bold text-center text-gray-900 tracking-widest text-lg"
                      value={passkeyInput}
                      onChange={(e) => setPasskeyInput(e.target.value)}
                    />
                </div>
    
                {error && (
                    <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">
                        <ShieldAlert size={16} /> {error}
                    </div>
                )}
    
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-tacsfon-green hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                   {loading ? <Loader className="animate-spin" /> : <>Unlock Dashboard <ArrowRight size={20}/></>}
                </button>
            </form>
          </div>
        </div>
      );
  }

  // 4. Authorized! (SHOW DASHBOARD)
  return <>{children}</>;
}