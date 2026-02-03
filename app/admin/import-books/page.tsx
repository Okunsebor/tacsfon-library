'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Save, Link as LinkIcon, BookOpen, Check, Loader2, Globe, X, CloudDownload } from 'lucide-react';
import Link from 'next/link';

export default function ImportBooks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // --- 1. THE "GLOBAL HUNTER" (GOOGLE WITH API KEY) ---
  const searchGlobalLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResults([]);
    setSelectedBook(null);
    setMessage('');

    // 🔴 PASTE YOUR API KEY HERE INSIDE THE QUOTES
    const GOOGLE_API_KEY = "AIzaSyDzPDOkFqVBq19IQPI8h5kOoOp0l9_dODo"; 

    try {
      console.log(`Hunting for: ${query}...`); 
      
      // We add '&key=' to the URL to authenticate
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=40&printType=books&key=${GOOGLE_API_KEY}`;
      
      const res = await fetch(url);
      
      // Improved Error Handling: Show the Status Code (e.g., 403, 429)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); // Try to get error text
        const errorMessage = errorData.error?.message || res.statusText;
        throw new Error(`Google Error (${res.status}): ${errorMessage}`);
      }

      const data = await res.json();
      
      if (data.totalItems === 0 || !data.items) {
          // If Google finds nothing, we can just show empty (or try OpenLibrary if you really want)
          setResults([]);
      } else {
          setResults(data.items);
      }

    } catch (error: any) {
      console.error("Search failed:", error);
      // Detailed alert to help us debug if it fails again
      alert(`Search failed: ${error.message}.`);
    } finally {
      setLoading(false);
    }
  };
  // --- 2. SELECT & PREPARE (SMART IMAGE FINDER) ---
  const handleSelect = (book: any) => {
    const info = book.volumeInfo;
    
    // STRATEGY 1: Search for the largest available Google Image
    const images = info.imageLinks || {};
    let bestImage = images.extraLarge || images.large || images.medium || images.small || images.thumbnail || images.smallThumbnail || '';

    // Fix Google's "Page Curl" effect and force HTTPS
    if (bestImage) {
        bestImage = bestImage.replace('edge=curl', '').replace('http://', 'https://');
    }

    // STRATEGY 2: If Google failed, try Open Library using ISBN
    if (!bestImage && info.industryIdentifiers) {
        const isbnInfo = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_13') || info.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
        if (isbnInfo) {
            // Open Library Cover API (L = Large size)
            bestImage = `https://covers.openlibrary.org/b/isbn/${isbnInfo.identifier}-L.jpg`;
        }
    }

    // STRATEGY 3: Final Fallback
    if (!bestImage) {
        bestImage = "https://placehold.co/400x600?text=No+Cover"; // Clean placeholder
    }

    setSelectedBook({
      title: info.title,
      author: info.authors ? info.authors[0] : 'Unknown Author',
      summary: info.description || 'No summary available.',
      category: info.categories ? info.categories[0] : 'General', 
      cover_url: bestImage, // <--- Now uses the smartest available link
      published_year: info.publishedDate ? info.publishedDate.substring(0, 4) : 'Unknown'
    });
    
    setDownloadLink('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 3. PUBLISH TO SUPABASE ---
  const saveToLibrary = async () => {
    if (!downloadLink) {
        setMessage('❌ Please paste the PDF/Download link first.');
        return;
    }
    setIsSaving(true);

    try {
      const { error } = await supabase.from('books').insert([
        {
          title: selectedBook.title,
          author: selectedBook.author,
          summary: selectedBook.summary,
          category: selectedBook.category,
          cover_url: selectedBook.cover_url,
          pdf_url: downloadLink, // <--- SAVING YOUR LINK HERE
          available_copies: 100, // It's digital, so effectively infinite
          is_trending: false
        }
      ]);

      if (error) throw error;

      setMessage('✅ Published successfully!');
      setTimeout(() => {
          setSelectedBook(null); // Close editor after 2s
          setMessage('');
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans p-6 pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-tacsfon-green font-bold transition-colors">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <X size={16} />
                </div>
                Back to Desk
            </Link>
            <div className="flex items-center gap-2 text-tacsfon-green bg-green-50 px-4 py-2 rounded-full border border-green-100">
                <Globe size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Global Database Connected</span>
            </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Import Hunter</h1>
            <p className="text-gray-500">Search the world's books, paste your link, and we handle the rest.</p>
        </div>

        {/* --- SECTION A: THE DRAFTING BOARD (Visible when a book is selected) --- */}
        {selectedBook && (
            <div className="bg-white rounded-3xl shadow-xl border-2 border-tacsfon-green p-8 mb-16 animate-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Book Cover Preview */}
                    <div className="w-48 shrink-0 mx-auto md:mx-0">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-gray-100 relative">
                            {selectedBook.cover_url ? (
                                <img src={selectedBook.cover_url} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">No Image</div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Editor */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">{selectedBook.category}</span>
                                <span className="text-gray-400 text-xs font-bold">{selectedBook.published_year}</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">{selectedBook.title}</h2>
                            <p className="text-xl text-tacsfon-green font-medium mt-1">{selectedBook.author}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto border border-gray-100">
                            {selectedBook.summary}
                        </div>

                        {/* --- THE MAGIC INPUT: DOWNLOAD LINK --- */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <LinkIcon size={14}/> Paste PDF/Drive Link Source
                            </label>
                            <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="e.g. https://drive.google.com/file/d/..." 
                                  className="flex-1 px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-tacsfon-green focus:bg-white outline-none font-medium transition-all"
                                  value={downloadLink}
                                  onChange={(e) => setDownloadLink(e.target.value)}
                                  autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-400">
                                Tip: You can copy links from OceanOfPDF, ZLibrary, or your own Google Drive.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setSelectedBook(null)}
                                className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveToLibrary}
                                disabled={isSaving}
                                className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                {isSaving ? 'Publishing...' : 'Publish to Library'}
                            </button>
                        </div>
                        
                        {message && (
                            <div className={`p-4 rounded-xl text-center font-bold ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- SECTION B: SEARCH BAR --- */}
        <div className={`transition-all duration-500 ${selectedBook ? 'opacity-50 pointer-events-none blur-[1px]' : 'opacity-100'}`}>
            <form onSubmit={searchGlobalLibrary} className="relative max-w-3xl mx-auto mb-12">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input 
                  type="text" 
                  placeholder="Search by Title, Author, or ISBN..." 
                  className="w-full pl-16 pr-6 py-6 rounded-2xl bg-white border border-gray-200 focus:border-tacsfon-green outline-none shadow-xl shadow-gray-100/50 text-lg font-medium placeholder:font-normal"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-tacsfon-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Hunt'}
                </button>
            </form>

            {/* --- SECTION C: RESULTS GRID --- */}
            {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {results.map((book: any) => {
                        const info = book.volumeInfo;
                        // Better image handling
                        const img = info.imageLinks?.thumbnail?.replace('http://', 'https://') || null;
                        
                        return (
                            <div 
                                key={book.id} 
                                onClick={() => handleSelect(book)}
                                className="group relative bg-white p-3 rounded-2xl border border-gray-100 hover:border-tacsfon-green/50 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2 duration-300" 
                            >
                                <div className="aspect-[2/3] bg-gray-50 rounded-xl overflow-hidden mb-4 relative shadow-inner">
                                    {img ? (
                                        <img src={img} alt={info.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <BookOpen size={32} />
                                        </div>
                                    )}
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <span className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform">
                                            <CloudDownload size={14} /> Select
                                        </span>
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1 group-hover:text-tacsfon-green transition-colors">
                                    {info.title}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-1 font-medium">
                                    {info.authors ? info.authors[0] : 'Unknown Author'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // --- EMPTY STATES ---
                <div className="text-center py-20">
                    {!loading && query && results.length === 0 ? (
                         // STATE: SEARCHED BUT FOUND NOTHING
                         <div className="animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg">No Books Found</h3>
                            <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">
                                We couldn't find anything matching "<span className="text-gray-900 font-bold">{query}</span>". Try a simpler title.
                            </p>
                        </div>
                    ) : !loading && !query ? (
                        // STATE: READY TO START
                        <div>
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-bold text-lg">Ready to Hunt</h3>
                            <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">
                                Enter a title above to search the global database.
                            </p>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && !selectedBook && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-lg">Ready to Hunt</h3>
                    <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">
                        Enter a title above to search the global database. Once found, you can attach your PDF link.
                    </p>
                </div>
            )}
        </div>

      </div>
    </main>
  );
}