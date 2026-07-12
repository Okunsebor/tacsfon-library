import { useEffect, useState } from 'react';
import { Book } from '@/lib/types';
import { fetchBookById } from '../api/books.api';

/**
 * Custom hook to load a single book's details by ID.
 * Handled in detail pages and text reader view.
 */
export function useBook(id: string | string[] | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const bookId = Array.isArray(id) ? id[0] : id;

    async function getBook() {
      try {
        setLoading(true);
        const data = await fetchBookById(bookId);
        setBook(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    }

    getBook();
  }, [id]);

  return { book, loading, error };
}
