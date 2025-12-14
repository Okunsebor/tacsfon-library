'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Download, Check, Loader, ArrowLeft, Clock, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ImportBooks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);

  // 1. SEARCH: Fetch data with "availability" info
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    setResults([]);

    try {
      // 'has_fulltext=true' ensures we only see books that actually exist digitally
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&has_fulltext=true&limit=20`);
      const data = await res.json();
      setResults(data.docs || []);
    } catch (err) {
      alert("Failed to search online.");
    }
    setSearching(false);
  };

  // 2. IMPORT: Handle the logic
  // ... inside importBook function ...

  const importBook = async (book: any) => {
    setImporting(book.key);

    const title = book.title;
    const author = book.author_name ? book.author_name[0] : 'Unknown Author';
    const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null;
    const iaId = book.ia ? book.ia[0] : null; 
    
    // SMART DETECTION:
    // If ebook_access is 'public', it's free. Otherwise, it requires login.
    const accessStatus = book.ebook_access === 'public' ? 'public' : 'borrowable';

    const newBook = {
      title: title,
      author: author,
      category: 'General',
      available_copies: 1,
      cover_url: coverUrl,
      ia_id: iaId,
      ebook_access: accessStatus, // <--- SAVING THE STATUS HERE
      summary: `First published in ${book.first_publish_year || 'Unknown'}.`
    };


    const { error } = await supabase.from('books').insert([newBook]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setResults(prev => prev.map(b => b.key === book.key ? { ...b, imported: true } : b));
    }
    setImporting(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-tacsfon-green font-bold">
                <ArrowLeft size={20} /> Back to Desk
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Book Hunter</h1>
            <div className="w-10"></div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search title (e.g. 'Pilgrims Progress' or 'Calculus')" 
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none text-lg"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={searching}
                    className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2"
                >
                    {searching ? <Loader className="animate-spin" /> : 'Search'}
                </button>
            </form>
        </div>

        {/* RESULTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((book) => (
                <div key={book.key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                    
                    {/* Cover */}
                    <div className="w-20 h-28 bg-gray-100 shrink-0 rounded-lg overflow-hidden">
                        {book.cover_i ? (
                            <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Cover</div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-between flex-grow">
                        <div>
                            <h3 className="font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{book.title}</h3>
                            <p className="text-xs text-gray-500 mb-2">{book.author_name ? book.author_name[0] : 'Unknown'}</p>
                            
                            {/* --- THE TRAFFIC LIGHT BADGES --- */}
                            {book.ebook_access === 'public' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded border border-green-200">
                                    <Globe size={10} /> Instant Read (Free)
                                </span>
                            ) : book.ebook_access === 'borrowable' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded border border-orange-200">
                                    <Clock size={10} /> Login Required
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">
                                    Physical Only
                                </span>
                            )}
                        </div>

                        {/* Button */}
                        {book.imported ? (
                            <button disabled className="mt-3 w-full py-2 rounded-lg bg-green-50 text-green-600 font-bold text-sm flex items-center justify-center gap-2 cursor-default">
                                <Check size={16} /> Added
                            </button>
                        ) : (
                            <button 
                                onClick={() => importBook(book)}
                                disabled={importing === book.key}
                                className={`mt-3 w-full py-2 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                    book.ebook_access === 'public' ? 'bg-tacsfon-green hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-800'
                                }`}
                            >
                                {importing === book.key ? <Loader size={16} className="animate-spin" /> : <><Download size={16} /> Import</>}
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </main>
  );
}