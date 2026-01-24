'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import { Search, Book, BookOpen } from 'lucide-react';

export default function Library() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Updated categories list to match your likely spreadsheet data
  const categories = ['All', 'Spiritual', 'Finance', 'Leadership', 'Relationship', 'Academic', 'Biography', 'General Collection'];

  useEffect(() => {
    fetchBooks();
  }, [category, search]);

  async function fetchBooks() {
    // We select specific columns to be efficient
    let query = supabase
      .from('books')
      .select('id, title, author, category, cover_url, pdf_url'); 
      // NOTICE: We are now using 'pdf_url' to match your database
    
    if (category !== 'All') query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    // Limit to 100 initially so we don't crash the browser with 5,000 items at once
    const { data } = await query.limit(100); 
    setBooks(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar />
      
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Digital Library</h1>
            <p className="text-gray-500">Explore our collection of {books.length}+ resources.</p>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-20 z-30 bg-gray-50/95 backdrop-blur py-2">
            <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input 
                  type="text" 
                  placeholder="Search by title or author..." 
                  className="w-full pl-12 p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-tacsfon-green outline-none"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                            category === cat 
                            ? 'bg-gray-900 text-white shadow-lg' 
                            : 'bg-white text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* BOOKS GRID */}
        {loading ? (
             <div className="text-center py-20 flex flex-col items-center animate-pulse">
                <BookOpen size={40} className="text-gray-300 mb-4"/>
                <p className="text-gray-400 font-bold">Loading Library...</p>
             </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                {books.map(book => (
                    <a key={book.id} href={book.pdf_url} target="_blank" className="group block h-full">
                        <div className="relative aspect-[2/3] mb-3 overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-2 bg-white border border-gray-100">
                            
                            {/* SMART COVER LOGIC */}
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                                /* Fallback if no cover exists */
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4 text-center">
                                    <Book size={32} className="mb-3 text-tacsfon-green opacity-80"/>
                                    <span className="font-bold text-sm leading-tight line-clamp-4">{book.title}</span>
                                </div>
                            )}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        
                        <div className="px-1">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-tacsfon-green transition-colors">{book.title}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1">{book.author || "Unknown Author"}</p>
                        </div>
                    </a>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}