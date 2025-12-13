'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, CheckCircle, X } from 'lucide-react';
import LogoLoader from './LogoLoader'; // Use your new loader!

export default function BorrowButton({ bookId, availableCopies }: { bookId: number, availableCopies: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleBorrow() {
    setLoading(true);

    // 1. CHECK USER: Are they logged in?
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // If not logged in, force them to login page
      alert("Please Log In or Sign Up to borrow books.");
      router.push('/login');
      return;
    }

    // 2. GET NAME: Get the name they signed up with
    const studentName = user.user_metadata.full_name || user.email;

    // 3. EXECUTE LOAN
    const { error: loanError } = await supabase
      .from('loans')
      .insert([{ book_id: bookId, student_name: studentName, status: 'active' }]);

    if (loanError) {
      alert("Error: " + loanError.message);
    } else {
      // Decrease Stock
      await supabase
        .from('books')
        .update({ available_copies: availableCopies - 1 })
        .eq('id', bookId);

      setIsOpen(false);
      alert(`Success! Book borrowed as ${studentName}.`);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        disabled={availableCopies === 0}
        className={`w-full font-bold py-4 rounded-xl transition duration-200 flex items-center justify-center gap-2
          ${availableCopies > 0 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg' 
            : 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/10'}`}
      >
        <BookOpen size={20} />
        {availableCopies > 0 ? 'Borrow This Book' : 'Out of Stock'}
      </button>

      {/* CONFIRMATION DIALOG (Glassmorphism) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass bg-[#1a1a2e] rounded-2xl w-full max-w-md p-6 border border-white/20 shadow-2xl">
            
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white">Confirm Request</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>

            {loading ? (
              <div className="py-8"><LogoLoader /></div>
            ) : (
              <div className="space-y-6">
                 <div className="bg-yellow-500/10 p-4 rounded-lg flex gap-3 text-yellow-200 text-sm border border-yellow-500/20">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>You are logged in. This book will be recorded under your account name automatically.</p>
                 </div>

                 <div className="flex gap-3">
                   <button 
                     onClick={() => setIsOpen(false)}
                     className="flex-1 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleBorrow}
                     className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg transition"
                   >
                     Confirm
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}