import { supabase } from '@/lib/supabaseClient';
import { Loan } from '@/lib/types';

/**
 * Data Access Layer for Loans.
 * Houses all database queries for the `loans` table.
 */

export async function fetchLoansByEmail(email: string): Promise<Loan[]> {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('student_email', email)
    .order('request_date', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Loan[];
}

export async function fetchPendingLoanForBook(bookId: string | number, email: string) {
  const { data, error } = await supabase
    .from('loans')
    .select('id, status, book_title')
    .eq('book_id', bookId)
    .eq('student_email', email)
    .eq('status', 'requested')
    .order('request_date', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchLoansByStatus(status: string): Promise<Loan[]> {
  let query = supabase
    .from('loans')
    .select('*, books(available_copies)')
    .order('request_date', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as any[];
}

export async function insertLoanRequest(loanPayload: Omit<Loan, 'id'>): Promise<void> {
  const { error } = await supabase.from('loans').insert([loanPayload]);
  if (error) throw new Error(error.message);
}

export async function rejectLoanRequest(id: number): Promise<void> {
  const { error } = await supabase
    .from('loans')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

/**
 * Marks a loan as returned and increments the book stock atomically.
 * Works with both `return_date` and `returned_date` columns to support different callers.
 */
export async function returnLoan(
  loanId: number,
  bookId: number,
  dateColumn: 'return_date' | 'returned_date' = 'return_date'
): Promise<void> {
  // 1. Mark Loan as Returned
  const { error: loanError } = await supabase
    .from('loans')
    .update({
      status: 'returned',
      [dateColumn]: new Date().toISOString()
    })
    .eq('id', loanId);

  if (loanError) throw new Error(loanError.message);

  // 2. Add Stock Back
  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('available_copies')
    .eq('id', bookId)
    .single();
  
  if (bookError) throw new Error(bookError.message);
  
  if (book) {
     const { error: updateBookError } = await supabase
       .from('books')
       .update({ available_copies: book.available_copies + 1 })
       .eq('id', bookId);
     if (updateBookError) throw new Error(updateBookError.message);
  }
}
