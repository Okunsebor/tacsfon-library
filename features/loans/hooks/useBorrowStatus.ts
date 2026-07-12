import { useEffect, useState } from 'react';
import { fetchPendingLoanForBook } from '../api/loans.api';

/**
 * Custom hook to check if a specific student has a pending borrow request for a book.
 * Distinguishes between physical and digital PDF requests.
 */
export function useBorrowStatus(bookId: string | number, userEmail: string | undefined) {
  const [requestStatus, setRequestStatus] = useState<'physical' | 'digital' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId || !userEmail) {
      setLoading(false);
      return;
    }
    const email: string = userEmail;

    async function checkStatus() {
      try {
        setLoading(true);
        const requests = await fetchPendingLoanForBook(bookId, email);
        if (requests && requests.length > 0) {
          const isDigital = requests[0].book_title.endsWith('(PDF Request)');
          setRequestStatus(isDigital ? 'digital' : 'physical');
        } else {
          setRequestStatus(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [bookId, userEmail]);

  return { requestStatus, setRequestStatus, loading, error };
}
