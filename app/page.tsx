'use client'; 
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      const { data, error } = await supabase.from('books').select('*');
      if (error) console.error(error);
      else setBooks(data || []);
      setLoading(false);
    }
    fetchBooks();
  }, []);

  // Group books by Category
  const categories = [...new Set(books.map(b => b.category || 'Uncategorized'))];

  if (loading) return <div className="text-center p-10">Loading Collections...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-blue-900 text-white p-10 text-center">
        <h1 className="text-4xl font-bold mb-2">TACSFON Library</h1>
        <p className="text-blue-200">Explore our spiritual and academic collections</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-12">
        {categories.map((category) => (
          <section key={category}>
            <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{category} Collection</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books
                .filter(book => (book.category || 'Uncategorized') === category)
                .map((book) => (
                  <Link href={`/book/${book.id}`} key={book.id} className="group">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                      <div className="h-48 bg-gray-200 group-hover:bg-blue-50 transition flex items-center justify-center text-gray-400">
                         <span className="text-4xl">📖</span>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded w-fit">
                             {book.available_copies} Left
                        </span>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}