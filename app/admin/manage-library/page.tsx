'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Save, Trash2, Wand2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ManageLibrary() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // --- 1. FETCH ALL BOOKS ---
  async function fetchBooks() {
    const { data } = await supabase.from('books').select('*').order('id', { ascending: false });
    if (data) setBooks(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  // --- 2. THE "REMASTER" LOGIC (Magic Wand) ---
  const handleRemaster = async (book: any) => {
    if (!confirm(`Auto-upgrade metadata for "${book.title}"? This will fetch a new Cover & Summary from Google.`)) return;
    
    setProcessingId(book.id);
    try {
      // A. SEARCH GOOGLE BOOKS
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(book.title)}&maxResults=1&printType=books`);
      const data = await res.json();
      
      if (!data.items || data.items.length === 0) {
        alert("Could not find a match on Google Books.");
        setProcessingId(null);
        return;
      }

      const match = data.items[0].volumeInfo;

      // B. GET BETTER DATA
      // 1. Get HTML Summary
      const newSummary = match.description || book.summary; 
      
      // 2. Get HD Cover (Try Google Large -> Google Thumb -> Keep Old)
      let newCover = book.cover_url;
      if (match.imageLinks) {
          const bestImg = match.imageLinks.extraLarge || match.imageLinks.large || match.imageLinks.medium || match.imageLinks.thumbnail;
          if (bestImg) {
              newCover = bestImg.replace('http://', 'https://').replace('&edge=curl', '');
          }
      }

      // 3. Get Category
      const newCategory = (match.categories && match.categories[0]) ? match.categories[0] : book.category;

      // C. UPDATE DATABASE (Keep ID & PDF Link intact)
      const { error } = await supabase
        .from('books')
        .update({ 
            summary: newSummary,
            cover_url: newCover,
            category: newCategory,
            author: match.authors ? match.authors[0] : book.author // Fix author spelling if needed
        })
        .eq('id', book.id);

      if (error) throw error;

      // D. REFRESH UI
      await fetchBooks();
      alert("✨ Book Remastered Successfully!");

    } catch (error: any) {
      alert("Error updating book: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // --- 3. DELETE FUNCTION ---
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will delete the book AND all its comments/history.")) return;
    
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (!error) {
        setBooks(books.filter(b => b.id !== id));
    } else {
        alert("Error deleting: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900">Library Manager</h1>
                <p className="text-gray-500 text-sm">Update, Edit, or Remaster your collection.</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <Wand2 size={16} /> Tip: Use "Remaster" to auto-fix covers & summaries.
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" /></div>
        ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {books.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">No books found. Go import some!</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {books.map((book) => (
                            <div key={book.id} className="p-4 flex flex-col md:flex-row gap-4 items-center hover:bg-gray-50 transition-colors group">
                                
                                {/* 1. IMAGE */}
                                <div className="w-16 h-24 shrink-0 relative rounded-md overflow-hidden bg-gray-200 border border-gray-200">
                                    <Image src={book.cover_url || '/placeholder.png'} alt="Cover" fill className="object-cover" />
                                </div>

                                {/* 2. INFO */}
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-bold text-gray-900 leading-tight">{book.title}</h3>
                                    <p className="text-sm text-gray-500">{book.author}</p>
                                    <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                                        <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {book.category || 'Uncategorized'}
                                        </span>
                                        {book.summary && book.summary.length > 50 && (
                                            <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                                <CheckCircle size={10} /> Has Summary
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 3. ACTIONS */}
                                <div className="flex gap-2">
                                    {/* MAGIC WAND BUTTON */}
                                    <button 
                                        onClick={() => handleRemaster(book)}
                                        disabled={!!processingId}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-2 rounded-lg transition-colors flex items-center gap-2 font-bold text-xs"
                                        title="Auto-Fetch New Cover & Summary"
                                    >
                                        {processingId === book.id ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16} />}
                                        <span className="hidden md:inline">Remaster</span>
                                    </button>

                                    {/* DELETE BUTTON */}
                                    <button 
                                        onClick={() => handleDelete(book.id)}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                                        title="Delete Book"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}