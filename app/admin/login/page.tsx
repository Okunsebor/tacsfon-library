'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Loader, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Access Denied: " + error.message);
      setLoading(false);
    } else {
      // SUCCESS: Redirect to the secure dashboard
      router.push('/admin'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-tacsfon-orange/10 text-tacsfon-orange rounded-2xl flex items-center justify-center mx-auto mb-4 border border-tacsfon-orange/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Librarian Access</h1>
          <p className="text-gray-400 text-sm mt-2">Restricted to authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Email</label>
            <input 
              type="email" 
              required 
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-xl focus:border-tacsfon-orange focus:ring-1 focus:ring-tacsfon-orange outline-none transition-all"
              placeholder="admin@tacsfon.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passcode</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                <input 
                type="password" 
                required 
                className="w-full bg-gray-700 border border-gray-600 text-white pl-12 pr-4 py-3 rounded-xl focus:border-tacsfon-orange focus:ring-1 focus:ring-tacsfon-orange outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" /> : <>Secure Login <ArrowRight size={20}/></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-500 text-sm hover:text-white transition-colors">
            ← Return to Library Home
          </Link>
        </div>
      </div>
    </div>
  );
}