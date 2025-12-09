'use client'; // This makes the button interactive

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function BorrowButton({ bookId, availableCopies }: { bookId: number, availableCopies: number }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleBorrow() {
    if (availableCopies <= 0) {
      alert("Sorry, this book is currently out of stock.");
      return;
    }

    // Simple identification for now
    const studentName = prompt("Please enter your Student Name/ID to borrow:");
    if (!studentName) return;

    setLoading(true);

    // 1. Create Loan Record
    const { error: loanError } = await supabase
      .from('loans')
      .insert([
        { book_id: bookId, student_name: studentName, status: 'active' }
      ]);

    if (loanError) {
      alert("Error borrowing book: " + loanError.message);
      setLoading(false);
      return;
    }

    // 2. Decrease Book Stock
    const { error: updateError } = await supabase
      .from('books')
      .update({ available_copies: availableCopies - 1 })
      .eq('id', bookId);

    if (updateError) {
      alert("Error updating stock.");
    } else {
      alert("Success! Please pick up your book at the TACSFON library stand.");
      router.refresh(); // Refresh page to show new stock number
    }
    
    setLoading(false);
  }

  return (
    <button 
      onClick={handleBorrow}
      disabled={loading || availableCopies === 0}
      className={`w-full font-bold py-4 rounded-lg transition duration-200 
        ${availableCopies > 0 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
    >
      {loading ? 'Processing...' : availableCopies > 0 ? 'Borrow This Book' : 'Out of Stock'}
    </button>
  );
}