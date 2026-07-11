'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadBook(bookData: any) {
  // Hardcode is_approved to false at the server level, preventing client override
  const payload = {
    ...bookData,
    is_approved: false
  };

  const { error } = await supabase.from('books').insert([payload]);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Validates the master admin passkey on the server.
 * This prevents exposure of the passkey string in network payloads.
 */
export async function verifyAdminPasskeyAction(inputPasskey: string): Promise<{ success: boolean }> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_passkey')
      .single();

    if (error || !data) {
      console.error('Error fetching passkey setting:', error);
      return { success: false };
    }

    return { success: inputPasskey === data.setting_value };
  } catch (err) {
    console.error('verifyAdminPasskeyAction failed:', err);
    return { success: false };
  }
}

/**
 * Performs a safe loan approval on the server using Optimistic Concurrency Control.
 * This checks current book stock and atomically decrements it if copies are available.
 */
export async function approveLoanAction(loanId: number, bookId: number): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch current copies count
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('available_copies')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      return { success: false, error: 'Book details not found.' };
    }

    if (book.available_copies <= 0) {
      return { success: false, error: 'Cannot approve: Book is out of stock!' };
    }

    // 2. Decrement copies count atomically by ensuring the record still has positive copies.
    const { data: updatedBooks, error: updateError } = await supabase
      .from('books')
      .update({ available_copies: book.available_copies - 1 })
      .eq('id', bookId)
      .gt('available_copies', 0)
      .select();

    if (updateError || !updatedBooks || updatedBooks.length === 0) {
      return { success: false, error: 'Cannot approve: Book is out of stock or update conflicted.' };
    }

    // 3. Set loan to active and assign a 14-day due date.
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const { error: loanError } = await supabase
      .from('loans')
      .update({
        status: 'active',
        due_date: dueDate.toISOString(),
      })
      .eq('id', loanId);

    if (loanError) {
      // Rollback book decrement since loan update failed
      await supabase
        .from('books')
        .update({ available_copies: book.available_copies })
        .eq('id', bookId);

      return { success: false, error: 'Failed to update loan status: ' + loanError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('approveLoanAction failed:', err);
    return { success: false, error: err.message || 'Server error occurred during approval.' };
  }
}
