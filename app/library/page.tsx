'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import { Search, Book, BookOpen, MapPin, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function Library() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // State for the Borrow Modal
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [requesting, setRequesting] = useState(false);

  const categories = ['All', 'Spiritual', 'Finance', 'Leadership', 'Relationship', 'Academic', 'Biography', 'General Collection'];

  useEffect(() => {
    // Get User for Borrow Requests
    async function getUser() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }
    getUser();
    fetchBooks();
  }, [category, search]);

  async function fetchBooks() {
    let query = supabase
      .from('books')
      .select('id, title, author, category, cover_url, pdf_url, available_copies, shelf_location')
      .order('created_at', { ascending: false });
    
    if (category !== 'All') query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data } = await query.limit(100); 
    setBooks(data || []);
    setLoading(false);
  }

  // --- BORROW LOGIC ---
  const handleRequestBorrow = async () => {
      if (!user) return alert("You must be logged in to borrow books.");
      if (!selectedBook) return;

      setRequesting(true);

      // 1. Create Loan Request
      const { error } = await supabase.from('loans').insert({
          student_email: user.email,
          book_id: selectedBook.id,
          book_title: selectedBook.title,
          status: 'requested'
      });

      if (error) {
          alert("Error requesting book: " + error.message);
      } else {
          alert("Request Sent! Please go to the library desk to pick up your book.");
          setSelectedBook(null); // Close modal
      }
      setRequesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar />
      
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Digital & Physical Library</h1>
            <p className="text-gray-500">Read PDFs instantly or request physical copies to borrow.</p>
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
             <div className="text-center py-20 flex flex-col items-center"><BookOpen size={40} className="text-gray-300 mb-4"/><p className="text-gray-400 font-bold">Loading Library...</p></div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                {books.map(book => (
                    <div key={book.id} className="group h-full flex flex-col">
                        <div className="relative aspect-[2/3] mb-3 overflow-hidden rounded-2xl shadow-md bg-white border border-gray-100">
                            {/* COVER IMAGE */}
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                                    <Book size={32} className="mb-3 text-tacsfon-green opacity-80"/>
                                    <span className="font-bold text-sm leading-tight line-clamp-3">{book.title}</span>
                                </div>
                            )}

                            {/* HOVER ACTION BUTTONS */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 p-4">
                                {/* READ PDF BUTTON */}
                                {book.pdf_url && (
                                    <a href={book.pdf_url} target="_blank" className="w-full py-2 bg-tacsfon-green text-white font-bold text-sm rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                                        <BookOpen size={16}/> Read PDF
                                    </a>
                                )}
                                
                                {/* BORROW PHYSICAL BUTTON */}
                                {book.available_copies > 0 ? (
                                    <button 
                                        onClick={() => setSelectedBook(book)}
                                        className="w-full py-2 bg-white text-gray-900 font-bold text-sm rounded-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                    >
                                        <MapPin size={16}/> Borrow Copy
                                    </button>
                                ) : (
                                    !book.pdf_url && <span className="text-white text-xs font-bold bg-red-500/50 px-3 py-1 rounded-full">Unavailable</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="px-1">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{book.title}</h3>
                            <p className="text-xs text-gray-500 mb-2">{book.author || "Unknown"}</p>
                            
                            {/* Stock Indicator */}
                            {book.available_copies > 0 && (
                                <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                    <CheckCircle size={10} /> {book.available_copies} In Stock
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- BORROW CONFIRMATION MODAL --- */}
      {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Borrow Physical Copy</h3>
                      <p className="text-sm text-gray-500 mt-2">
                          You are requesting to borrow <strong>"{selectedBook.title}"</strong>.
                      </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 mb-6 space-y-2">
                      <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> <span>Available at: <strong>{selectedBook.shelf_location || "Main Library Desk"}</strong></span></div>
                      <div className="flex items-center gap-2"><Clock size={14} className="text-blue-500"/> <span>Request expires in 24 hours if not picked up.</span></div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setSelectedBook(null)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                      <button 
                        onClick={handleRequestBorrow} 
                        disabled={requesting}
                        className="flex-1 py-3 font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                      >
                          {requesting ? "Sending..." : "Confirm Request"}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}