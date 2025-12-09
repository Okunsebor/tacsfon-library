'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ReturnButton({ loanId, bookId }: { loanId: number, bookId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReturn() {
    const confirmReturn = confirm("Confirm that you have received this book back?");
    if (!confirmReturn) return;

    setLoading(true);

    // 1. Mark Loan as Returned
    const { error: loanError } = await supabase
      .from('loans')
      .update({ status: 'returned', returned_date: new Date().toISOString() })
      .eq('id', loanId);

    if (loanError) {
      alert("Error returning book");
      setLoading(false);
      return;
    }

    // 2. Increase Book Stock (Fetch current stock first to be safe)
    const { data: book } = await supabase.from('books').select('available_copies').eq('id', bookId).single();
    
    if (book) {
      await supabase
        .from('books')
        .update({ available_copies: book.available_copies + 1 })
        .eq('id', bookId);
    }

    alert("Book returned successfully!");
    router.refresh();
    setLoading(false);
  }

  return (
    <button 
      onClick={handleReturn}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition"
    >
      {loading ? 'Processing...' : 'Mark Returned'}
    </button>
  );
}