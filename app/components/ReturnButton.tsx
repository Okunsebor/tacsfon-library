'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { returnLoan } from '@/features/loans/api/loans.api';

export default function ReturnButton({ loanId, bookId }: { loanId: number, bookId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReturn() {
    const confirmReturn = confirm("Confirm that you have received this book back?");
    if (!confirmReturn) return;

    setLoading(true);

    try {
      // ⚡ Safe transactional return loan API call
      await returnLoan(loanId, bookId, 'returned_date');
      alert("Book returned successfully!");
      router.refresh();
    } catch (err: any) {
      alert("Error returning book: " + err.message);
    } finally {
      setLoading(false);
    }
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