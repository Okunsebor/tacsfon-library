import { useEffect, useState, useMemo } from 'react';
import { Book } from '@/lib/types';
import { fetchApprovedBooks } from '../api/books.api';
import { smartCategorize } from '@/lib/categorize';

/**
 * Custom hook to handle loading, categorizing, and shuffling books for the catalog.
 */
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const allBooks = await fetchApprovedBooks();
        setBooks(allBooks);
        
        // Statistically correct Fisher-Yates shuffle for trending section
        const arr = [...allBooks];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setTrendingBooks(arr.slice(0, 10));
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const categories = useMemo(() => {
    return books.reduce((acc, book) => {
      const catRaw = smartCategorize(book);
      const cat = catRaw.charAt(0).toUpperCase() + catRaw.slice(1);
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(book);
      return acc;
    }, {} as Record<string, Book[]>);
  }, [books]);

  const sortedCategoryNames = useMemo(() => {
    return Object.keys(categories).sort();
  }, [categories]);

  return {
    books,
    trendingBooks,
    categories,
    sortedCategoryNames,
    loading,
    error,
  };
}
