'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  Globe, 
  UploadCloud, 
  Folder, 
  PlusCircle, 
  Menu, 
  X, 
  Search, 
  Trash2, 
  Edit,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'inventory' | 'inbox'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [requests, setRequests] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]); // For Contact Inbox
  const router = useRouter();

  // 1. FETCH ALL DATA
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      
      await fetchData();
    }
    init();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    // Fetch Borrow Requests
    const { data: reqs } = await supabase.from('borrow_requests').select('*').order('request_date', { ascending: false });
    setRequests(reqs || []);

    // Fetch Books
    const { data: allBooks } = await supabase.from('books').select('*').order('title', { ascending: true });
    setBooks(allBooks || []);

    // Fetch Messages (The Missing Inbox)
    const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages(msgs || []);
    
    setLoading(false);
  }

  // --- ACTIONS ---
  const handleDeleteBook = async (id: number, title: string) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    
    // Cleanup linked data first
    await supabase.from('loans').delete().eq('book_id', id);
    await supabase.from('borrow_requests').delete().eq('book_id', id);
    
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) alert("Error: " + error.message);
    else {
      setBooks(books.filter(b => b.id !== id));
      alert("Book deleted.");
    }
  };

  const handleRequestAction = async (id: number, status: string, bookId: number) => {
    await supabase.from('borrow_requests').update({ status }).eq('id', id);
    if (status === 'Approved') {
        const book = books.find(b => b.id === bookId);
        if (book) {
            await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', bookId);
        }
    }
    fetchData(); // Refresh to show updates
  };

  // --- NAVIGATION LINKS ---
  const NavItem = ({ id, label, icon: Icon, link }: any) => {
    // If it's a link (like Add Book), navigate. If it's a tab (like Inbox), switch view.
    if (link) {
      return (
        <Link href={link} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl transition-all mb-1">
          <Icon size={20} /> <span className="font-medium">{label}</span>
        </Link>
      );
    }
    return (
      <button 
        onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${activeTab === id ? 'bg-tacsfon-green text-white font-bold shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
      >
        <Icon size={20} /> <span className="font-medium">{label}</span>
      </button>
    );
  };

  if (loading && !books.length) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* 1. SIDEBAR (Desktop) & MOBILE MENU WRAPPER */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block shadow-2xl`}>
        
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-tacsfon-neonGreen tracking-wider">LIBRARIAN<span className="text-white">DESK</span></h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden ml-auto text-gray-400"><X /></button>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
          
          <div>
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Overview</p>
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="inventory" label="Book Inventory" icon={BookOpen} />
            <NavItem id="inbox" label="Inbox Messages" icon={MessageSquare} />
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Actions</p>
            <NavItem link="/admin/add-book" label="Add New Book" icon={PlusCircle} />
            <NavItem link="/admin/import-books" label="Book Hunter (Import)" icon={Globe} />
            <NavItem link="/admin/upload-media" label="Media Manager" icon={UploadCloud} />
            <NavItem link="/admin/academic-hub" label="Academic Hub" icon={Folder} />
          </div>

          <div className="pt-8 border-t border-gray-800">
             <button onClick={() => router.push('/')} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors w-full">
                <LogOut size={20} /> <span>Exit Admin</span>
             </button>
          </div>

        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between md:hidden shrink-0">
           <span className="font-bold text-gray-800">Admin Panel</span>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-gray-100 rounded-lg"><Menu /></button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* TAB: DASHBOARD (Requests) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Requests</h2>
                {requests.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl text-center text-gray-400 border border-gray-100">
                        <p>No pending borrow requests.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{req.book_title}</h3>
                                <p className="text-sm text-gray-500">{req.student_name} • <span className={`font-bold text-xs uppercase px-2 py-1 rounded ${req.request_type === 'digital' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>{req.request_type} Request</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRequestAction(req.id, 'Rejected', req.book_id)} className="px-4 py-2 border border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50">Reject</button>
                                <button onClick={() => handleRequestAction(req.id, 'Approved', req.book_id)} className="px-6 py-2 bg-tacsfon-green text-white rounded-xl font-bold shadow-md hover:bg-green-700">Approve</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
          )}

          {/* TAB: INBOX (Restored) */}
          {activeTab === 'inbox' && (
             <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Inbox Messages</h2>
                {messages.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl text-center text-gray-400 border border-gray-100">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20"/>
                        <p>No messages received yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {messages.map(msg => (
                            <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900">{msg.name}</h3>
                                    <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-tacsfon-green font-medium mb-3">{msg.email}</p>
                                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl text-sm">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          )}

          {/* TAB: INVENTORY */}
          {activeTab === 'inventory' && (
             <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Book Inventory ({books.length})</h2>
                    <Link href="/admin/add-book" className="bg-tacsfon-orange text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-orange-600 flex items-center gap-2">
                        <PlusCircle size={16}/> Add Book
                    </Link>
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold"><tr><th className="p-6">Book</th><th className="p-6">Category</th><th className="p-6">Stock</th><th className="p-6 text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {books.map(book => (
                                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-6 font-bold flex items-center gap-3 min-w-[300px]">
                                            <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden shrink-0">
                                                {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover"/>}
                                            </div>
                                            <div>
                                                <div className="text-gray-900 line-clamp-1">{book.title}</div>
                                                <div className="text-xs text-gray-400 font-normal">{book.author}</div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm text-gray-500">{book.category}</td>
                                        <td className="p-6 font-bold text-gray-800">{book.available_copies}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* PDF Helper */}
                                                {!book.pdf_url && !book.ia_id && (
                                                    <a href={`https://www.google.com/search?q=filetype:pdf+${encodeURIComponent(book.title)}`} target="_blank" className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100" title="Find PDF"><Search size={16}/></a>
                                                )}
                                                <Link href={`/admin/edit-book/${book.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18} /></Link>
                                                <button onClick={() => handleDeleteBook(book.id, book.title)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}