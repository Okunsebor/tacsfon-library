'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, BookOpen, Download, Loader2, Save, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// --- UTILITY: SMART CATEGORIZER (The "Organizer") ---
// We analyze the raw keywords and force them into YOUR shelves.
const normalizeCategory = (categories: string[], title: string, subtitle: string) => {
  // Combine all data into one search string
  const text = (categories.join(' ') + ' ' + title + ' ' + subtitle).toLowerCase();

  // 1. SPIRITUAL / RELIGIOUS (Priority)
  if (text.includes('god') || text.includes('bible') || text.includes('prayer') || text.includes('christian') || text.includes('church') || text.includes('faith') || text.includes('religion') || text.includes('spirit') || text.includes('gospel') || text.includes('devotional')) {
      return 'Spiritual';
  }
  
  // 2. BUSINESS (Aggressive Mapping)
  // Catches: "Economics", "Management", "Leadership", "Finance", "Self-Management", "Entrepreneurship"
  if (text.includes('business') || text.includes('economics') || text.includes('management') || text.includes('finance') || text.includes('wealth') || text.includes('money') || text.includes('entrepreneur') || text.includes('leadership') || text.includes('sales') || text.includes('marketing') || text.includes('atomic habits') || text.includes('negotiation')) {
      return 'Business';
  }

  // 3. ACADEMIC / TECH
  if (text.includes('engineering') || text.includes('software') || text.includes('programming') || text.includes('computer') || text.includes('science') || text.includes('academic') || text.includes('mathematics') || text.includes('physics') || text.includes('biology') || text.includes('history')) {
      return 'Academic';
  }

  // 4. RELATIONSHIPS
  if (text.includes('marriage') || text.includes('dating') || text.includes('relationship') || text.includes('love') || text.includes('family') || text.includes('parenting') || text.includes('sex')) {
      return 'Relationships';
  }

  // 5. PERSONAL DEVELOPMENT (Catch-all for self-help that isn't business)
  if (text.includes('self-help') || text.includes('motivation') || text.includes('psychology') || text.includes('wisdom')) {
      return 'Personal Development';
  }

  // Fallback: If we can't guess, just use the first word Google gave us, or 'General'
  return categories[0] || 'General';
};

export default function ImportBooks() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [downloadLink, setDownloadLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // --- 1. THE "HYBRID HUNTER" (Search) ---
  const searchGlobalLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setSelectedBook(null);

    try {
      let foundBooks: any[] = [];

      // Attempt 1: Google Books
      try {
          const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books`);
          if (googleRes.ok) {
             const data = await googleRes.json();
             if (data.items) foundBooks = data.items.map((item: any) => ({ ...item, source: 'Google' }));
          }
      } catch (err) { console.warn("Google search failed", err); }

      // Attempt 2: Open Library Fallback
      if (foundBooks.length === 0) {
          const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
          const olData = await olRes.json();
          if (olData.docs) {
              foundBooks = olData.docs.map((doc: any) => ({
                  id: doc.key, 
                  source: 'OpenLibrary',
                  volumeInfo: {
                      title: doc.title,
                      authors: doc.author_name || ['Unknown'],
                      imageLinks: doc.cover_i ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : null
                  }
              }));
          }
      }
      setResults(foundBooks);
    } catch (error) {
      alert("Search failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. THE "DEEP FETCH" + "SAFE IMAGE" ---
  const handleSelect = async (book: any) => {
    // 1. CAPTURE THE IMAGE WE ALREADY SEE (The Safety Net)
    // If the deep fetch fails, we fall back to this so the image NEVER disappears.
    const safetyCover = book.volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || '';

    setDraftLoading(true);
    setSelectedBook(null);
    setDownloadLink('');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        let fullInfo: any = {};
        let finalCover = safetyCover; // Start with the known good image
        let rawCategories: string[] = [];

        // A. FETCH FULL DETAILS
        if (book.source === 'Google') {
            const detailRes = await fetch(`https://www.googleapis.com/books/v1/volumes/${book.id}`);
            const detailData = await detailRes.json();
            const info = detailData.volumeInfo || book.volumeInfo;

            fullInfo = {
                title: info.title,
                subtitle: info.subtitle || '',
                author: info.authors ? info.authors[0] : 'Unknown',
                summary: info.description || "No summary available.",
                published_year: info.publishedDate ? info.publishedDate.substring(0, 4) : 'Unknown'
            };
            rawCategories = info.categories || [];
            
            // IMAGE UPGRADE LOGIC (Only if better exists)
            if (info.imageLinks) {
                // Try to find the biggest Google image available
                const bestGoogle = info.imageLinks.extraLarge || info.imageLinks.large || info.imageLinks.medium;
                if (bestGoogle) {
                    finalCover = bestGoogle.replace('http://', 'https://').replace('&edge=curl', '');
                } else if (!finalCover && info.imageLinks.thumbnail) {
                    // If we had no safety cover, take the thumbnail and clean it
                    finalCover = info.imageLinks.thumbnail.replace('http://', 'https://').replace('&edge=curl', '');
                }
            }
        } 
        else {
            // Open Library Logic
            const workRes = await fetch(`https://openlibrary.org${book.id}.json`);
            const workData = await workRes.json();
            let desc = "No summary available.";
            if (typeof workData.description === 'string') desc = workData.description;
            else if (workData.description?.value) desc = workData.description.value;

            fullInfo = {
                title: workData.title,
                subtitle: '',
                author: book.volumeInfo.authors[0],
                summary: desc,
                published_year: workData.first_publish_date ? workData.first_publish_date.substring(0, 4) : 'Unknown'
            };
            rawCategories = workData.subjects || [];
            
            // Try to get high-res from Open Library
            if (book.volumeInfo.imageLinks?.thumbnail) {
                finalCover = book.volumeInfo.imageLinks.thumbnail.replace('-M.jpg', '-L.jpg');
            }
        }

        // B. FALLBACK IF STILL EMPTY
        if (!finalCover) finalCover = "https://placehold.co/400x600?text=No+Cover";

        // C. APPLY SMART CATEGORIZATION
        const smartShelf = normalizeCategory(rawCategories, fullInfo.title, fullInfo.subtitle);

        setSelectedBook({
            ...fullInfo,
            category: smartShelf,
            cover_url: finalCover // Now guaranteed to be at least the thumbnail
        });

    } catch (error) {
        console.error("Selection Error:", error);
        alert("Could not load full details. Using basic info.");
        setDraftLoading(false);
    } finally {
        setDraftLoading(false);
    }
  };

  
  // --- 3. SAVE TO SUPABASE (SCHEMA MATCHED) ---
  const handleSave = async () => {
    if (!downloadLink) {
        alert("Please paste a PDF/Drive link first.");
        return;
    }
    setSaving(true);
    try {
        const { error } = await supabase.from('books').insert([{
            // 1. Text Fields
            title: selectedBook.title,
            author: selectedBook.author,
            category: selectedBook.category,
            summary: selectedBook.summary, // Matches 'summary' column
            
            // 2. URLs (The Critical Fixes)
            cover_url: selectedBook.cover_url, // Matches 'cover_url' column
            pdf_url: downloadLink,             // Matches 'pdf_url' column
            total_copies: 1,
            available_copies: 1
        }]);

        if (error) throw error;
        
        setMessage('Book saved to ' + selectedBook.category + '!');
        setTimeout(() => {
            setSelectedBook(null);
            setMessage('');
            setQuery('');
            setResults([]);
        }, 2000);
    } catch (error: any) {
        alert(`Database Error: ${error.message}`);
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 py-8 px-4 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Import Hunter</h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">Smart Sorting Active: Books will automatically be placed on the correct shelf.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        
        {/* SEARCH BAR */}
        {!selectedBook && !draftLoading && (
            <form onSubmit={searchGlobalLibrary} className="relative mb-12">
                <input 
                    type="text" 
                    placeholder="Search title..." 
                    className="w-full pl-12 pr-32 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-tacsfon-green/20 focus:border-tacsfon-green transition-all text-lg"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-tacsfon-green text-white px-6 rounded-xl font-bold">
                    {loading ? <Loader2 className="animate-spin" /> : 'Hunt'}
                </button>
            </form>
        )}

        {/* LOADING */}
        {draftLoading && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                <Loader2 size={48} className="text-tacsfon-green animate-spin mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Sorting Book...</h3>
                <p className="text-gray-500 text-sm">Analyzing metadata and fetching HD cover.</p>
            </div>
        )}

        {/* DRAFT BOARD */}
        {selectedBook && !draftLoading && (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Draft Board</h2>
                    <button onClick={() => setSelectedBook(null)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full"><X size={24} /></button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-100">
                             <Image src={selectedBook.cover_url} alt={selectedBook.title} fill className="object-cover" />
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 space-y-6">
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 mb-2 leading-tight">{selectedBook.title}</h3>
                            <p className="text-xl text-gray-500 font-medium">{selectedBook.author}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* THIS IS THE SMART CATEGORY BADGE */}
                            <span className="px-3 py-1 bg-tacsfon-green/10 text-tacsfon-green font-bold text-xs rounded-full uppercase tracking-wide">
                                {selectedBook.category}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 font-bold text-xs rounded-full">
                                {selectedBook.published_year}
                            </span>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Summary</h4>
                            {/* RENDER HTML SAFELY */}
                            <div className="text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto pr-2" dangerouslySetInnerHTML={{ __html: selectedBook.summary }} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-900 uppercase mb-2 flex items-center gap-2"><Download size={14} /> Paste PDF/Drive Link</label>
                            <input 
                                type="url" 
                                placeholder="e.g. https://drive.google.com..." 
                                className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-tacsfon-green font-medium"
                                value={downloadLink}
                                onChange={(e) => setDownloadLink(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button onClick={handleSave} disabled={saving} className="flex-1 bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                                {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save to {selectedBook.category}</>}
                            </button>
                        </div>
                        {message && <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 font-bold animate-in fade-in"><BookOpen size={20} /> {message}</div>}
                    </div>
                </div>
            </div>
        )}

        {/* RESULTS GRID */}
        {!selectedBook && !draftLoading && !loading && results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-8">
                {results.map((book: any) => (
                    <div key={book.id} onClick={() => handleSelect(book)} className="group relative bg-white p-3 rounded-2xl border border-gray-100 hover:border-tacsfon-green/50 hover:shadow-2xl transition-all cursor-pointer hover:-translate-y-2 duration-300">
                        <div className="aspect-[2/3] bg-gray-50 rounded-xl overflow-hidden mb-4 relative shadow-inner">
                            {book.volumeInfo.imageLinks?.thumbnail ? (
                                <img src={book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')} alt={book.volumeInfo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={32} /></div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full transform scale-90 group-hover:scale-100 transition-transform">Select</span></div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1 group-hover:text-tacsfon-green">{book.volumeInfo.title}</h3>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}