'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, Book, User, Clock, Edit } from 'lucide-react';
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
      // 1. Check if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); 
        return;
      }

      // 2. Fetch Data
      fetchData();
    }
    init();
  }, [router]);

  async function fetchData() {
    // Get Pending Requests
    const { data: reqs } = await supabase
      .from('borrow_requests')
      .select('*')
      .eq('status', 'Pending')
      .order('request_date', { ascending: false });
    
    // Get All Books
    const { data: allBooks } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true });

    setRequests(reqs || []);
    setBooks(allBooks || []);
    setLoading(false);
  }

  const handleRequest = async (id: number, status: string, bookId: number) => {
    await supabase.from('borrow_requests').update({ status }).eq('id', id);
    if (status === 'Approved') {
        const { data: book } = await supabase.from('books').select('available_copies').eq('id', bookId).single();
        if (book) {
            await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', bookId);
        }
    }
    fetchData(); 
    alert(`Request ${status}!`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Librarian Desk</h1>
                <p className="text-gray-500">Manage students and inventory</p>
            </div>
            <Link href="/admin/add-book" className="bg-tacsfon-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg">
                + Add New Book
            </Link>
        </div>

        {/* TABS (This is the NEW Layout) */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-1">
            <button 
                onClick={() => setActiveTab('requests')}
                className={`pb-3 px-4 font-bold text-lg transition-all ${activeTab === 'requests' ? 'text-tacsfon-green border-b-4 border-tacsfon-green' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Borrow Requests ({requests.length})
            </button>
            <button 
                onClick={() => setActiveTab('books')}
                className={`pb-3 px-4 font-bold text-lg transition-all ${activeTab === 'books' ? 'text-tacsfon-green border-b-4 border-tacsfon-green' : 'text-gray-400 hover:text-gray-600'}`}
            >
                Book Inventory ({books.length})
            </button>
        </div>

        {/* TAB 1: REQUESTS */}
        {activeTab === 'requests' && (
            <div className="space-y-4">
                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">All caught up! No pending requests.</h3>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Book size={18} className="text-tacsfon-orange"/> {req.book_title}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                    <User size={16} /> <span className="font-bold text-gray-700">{req.student_name}</span> ({req.student_email})
                                </p>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Clock size={12} /> {new Date(req.request_date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => handleRequest(req.id, 'Rejected', req.book_id)} className="px-6 py-2 rounded-lg border border-red-100 text-red-500 font-bold hover:bg-red-50">Reject</button>
                                <button onClick={() => handleRequest(req.id, 'Approved', req.book_id)} className="px-6 py-2 rounded-lg bg-tacsfon-green text-white font-bold hover:bg-green-700 shadow-md">Approve</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === 'books' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-6">Title</th>
                            <th className="p-6">Category</th>
                            <th className="p-6">Stock</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {books.map(book => (
                            <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6 font-bold text-gray-800">{book.title}</td>
                                <td className="p-6 text-sm text-gray-500"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">{book.category}</span></td>
                                <td className="p-6"><span className={`font-bold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-500'}`}>{book.available_copies}</span></td>
                                <td className="p-6 text-right">
                                    <Link href={`/admin/edit-book/${book.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-tacsfon-green hover:underline"><Edit size={16} /> Edit</Link>
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