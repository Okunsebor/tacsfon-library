'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, Book, User, Clock, Edit, Search, Trash2, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LibrarianDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('requests'); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); 
        return;
      }
      fetchData();
    }
    init();
  }, [router]);

  async function fetchData() {
    // Get Pending Requests
    const { data: reqs } = await supabase.from('borrow_requests').select('*').eq('status', 'Pending').order('request_date', { ascending: false });
    // Get All Books
    const { data: allBooks } = await supabase.from('books').select('*').order('title', { ascending: true });

    setRequests(reqs || []);
    setBooks(allBooks || []);
    setLoading(false);
  }

  // --- NEW: DELETE FUNCTION ---
  // --- NEW: STRONGER DELETE FUNCTION ---
  const handleDelete = async (id: number, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${title}"?`);
    if (!confirmDelete) return;

    // 1. First, delete any history in the 'loans' table (This fixes the error you saw)
    await supabase.from('loans').delete().eq('book_id', id);

    // 2. Also delete any 'borrow_requests'
    await supabase.from('borrow_requests').delete().eq('book_id', id);

    // 3. NOW it is safe to delete the book
    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) {
      alert("Failed to delete book: " + error.message);
    } else {
      // Remove from UI instantly without refreshing
      setBooks(books.filter(book => book.id !== id));
      alert("Book deleted.");
    }
  };

  const handleRequest = async (id: number, status: string, bookId: number) => {
    await supabase.from('borrow_requests').update({ status }).eq('id', id);
    if (status === 'Approved') {
        const { data: book } = await supabase.from('books').select('available_copies').eq('id', bookId).single();
        if (book) await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', bookId);
    }
    fetchData(); 
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Librarian Desk</h1>
                <p className="text-gray-500">Manage students, books, and media.</p>
            </div>
            <div className="flex gap-3">
                <Link href="/admin/import-books" className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2">
                    <span className="text-xl"><Globe size={20}/></span> Bulk Import
                </Link>
                <Link href="/admin/upload-media" className="bg-gray-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md flex items-center gap-2">
                    <span className="text-tacsfon-neonGreen text-xl">+</span> Upload Media
                </Link>
                <Link href="/admin/add-book" className="bg-tacsfon-orange text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md flex items-center gap-2">
                    <span className="text-white text-xl">+</span> Add Book
                </Link>
            </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-1">
            <button onClick={() => setActiveTab('requests')} className={`pb-3 px-4 font-bold text-lg ${activeTab === 'requests' ? 'text-tacsfon-green border-b-4 border-tacsfon-green' : 'text-gray-400'}`}>Borrow Requests ({requests.length})</button>
            <button onClick={() => setActiveTab('books')} className={`pb-3 px-4 font-bold text-lg ${activeTab === 'books' ? 'text-tacsfon-green border-b-4 border-tacsfon-green' : 'text-gray-400'}`}>Inventory ({books.length})</button>
        </div>

        {/* TAB 1: REQUESTS */}
        {activeTab === 'requests' && (
            <div className="space-y-4">
                {requests.length === 0 ? <div className="text-center py-20 bg-white rounded-3xl text-gray-400">All caught up!</div> : 
                    requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{req.book_title}</h3>
                                <p className="text-sm text-gray-500">{req.student_name} • <span className="font-bold text-xs uppercase bg-gray-100 px-2 py-1 rounded">{req.request_type} Request</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRequest(req.id, 'Rejected', req.book_id)} className="px-4 py-2 border text-red-500 rounded-lg font-bold">Reject</button>
                                <button onClick={() => handleRequest(req.id, 'Approved', req.book_id)} className="px-4 py-2 bg-tacsfon-green text-white rounded-lg font-bold">Approve</button>
                            </div>
                        </div>
                ))}
            </div>
        )}

        {/* TAB 2: INVENTORY (Updated with Delete) */}
        {activeTab === 'books' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold"><tr><th className="p-6">Title</th><th className="p-6">Category</th><th className="p-6">Stock</th><th className="p-6 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {books.map(book => (
                            <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6 font-bold flex items-center gap-3">
                                    <img src={book.cover_url || "https://placehold.co/50"} alt="" className="w-8 h-12 object-cover rounded shadow-sm" />
                                    {book.title}
                                </td>
                                <td className="p-6 text-sm">{book.category}</td>
                                <td className="p-6 font-bold">{book.available_copies}</td>
                                <td className="p-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        
                                        {/* EDIT BUTTON */}
                                        <Link href={`/admin/edit-book/${book.id}`} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Book">
                                            <Edit size={18} />
                                        </Link>

                                        {/* NEW: DELETE BUTTON */}
                                        <button 
                                            onClick={() => handleDelete(book.id, book.title)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete Book"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        {/* FIND PDF HELPER (Shows if no digital link exists) */}
                                        {!book.pdf_url && !book.ia_id && (
                                            <a 
                                                href={`https://www.google.com/search?q=filetype:pdf+${encodeURIComponent(book.title)}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-md border border-red-100 hover:bg-red-100"
                                                title="Search Google for this PDF"
                                            >
                                                <Search size={10} /> Find PDF
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </main>
  );
}