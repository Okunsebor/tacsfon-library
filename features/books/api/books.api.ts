import { supabase } from '@/lib/supabaseClient';
import { Book } from '@/lib/types';

/**
 * Data Access Layer for Books.
 * Houses all database queries for the `books` and related tables.
 */

export async function fetchApprovedBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('id, title, author, cover_url, category, available_copies, is_approved, ebook_access, ia_id, summary')
    .eq('is_approved', true)
    .order('title', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as Book[];
}

export async function fetchBookById(id: string | number): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .eq('is_approved', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Single row missing
    throw new Error(error.message);
  }
  return data as Book;
}

export async function fetchReadingHistory(email: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('reading_history')
    .select('last_read_at, book_id, books (id, title, author, cover_url)')
    .eq('user_email', email)
    .order('last_read_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function upsertReadingHistory(email: string, bookId: number | string): Promise<void> {
  const { error } = await supabase.from('reading_history').upsert({
    user_email: email,
    book_id: bookId,
    last_read_at: new Date().toISOString()
  }, { onConflict: 'user_email, book_id' });

  if (error) throw new Error(error.message);
}

export async function fetchDashboardBooks(limit = 8): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('is_approved', true)
    .order('id', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []) as Book[];
}
