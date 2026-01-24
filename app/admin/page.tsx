'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminGatekeeper from '@/app/components/AdminGatekeeper';
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
  ChevronRight,
  Lock,
  ClipboardList // ✅ Added for Loan Manager Icon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [requests, setRequests] = useState<any[]>([]); // Will now hold 'loans'
  const [books, setBooks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]); 
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) { 
        router.push('/admin/login'); 
        return; 
      }
      
      setCheckingAuth(false);
      await fetchData();
    }
    init();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    
    // ✅ UPDATE 1: Fetch from the new 'loans' table instead of 'borrow_requests'
    const { data: reqs } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'requested') // Only show pending requests here
        .order('request_date', { ascending: false });
    setRequests(reqs || []);

    const { data: allBooks } = await supabase.from('books').select('*').order('title', { ascending: true });
    setBooks(allBooks || []);

    const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages(msgs || []);
    
    setLoading(false);
  }

  const handleDeleteBook = async (id: number, title: string) => {
    if (!window.confirm(`Permanently delete "${title}"?`)) return;
    
    // Clean up related data first to prevent database errors
    await supabase.from('loans').delete().eq('book_id', id);
    
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) alert("Error: " + error.message);
    else {
      setBooks(books.filter(b => b.id !== id));
      alert("Book deleted.");
    }
  };

  // ✅ UPDATE 2: Updated Logic for Approving Loans directly from Dashboard
  const handleRequestAction = async (loanId: number, action: 'Approve' | 'Reject', bookId: number) => {
    
    if (action === 'Reject') {
        if(!confirm("Reject this request?")) return;
        await supabase.from('loans').update({ status: 'rejected' }).eq('id', loanId);
    } 
    else if (action === 'Approve') {
        if(!confirm("Approve this loan?")) return;
        
        // 1. Check Stock
        const book = books.find(b => b.id === bookId);
        if (book && book.available_copies > 0) {
            // 2. Deduct Stock
            await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', bookId);
            
            // 3. Activate Loan & Set Due Date (14 Days)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            await supabase.from('loans').update({ 
                status: 'active',
                due_date: dueDate.toISOString()
            }).eq('id', loanId);
        } else {
            return alert("Cannot approve: Book is out of stock!");
        }
    }

    await fetchData(); // Refresh UI
  };

  const NavItem = ({ id, label, icon: Icon, link }: any) => {
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-tacsfon-orange animate-pulse font-bold text-xl">Verifying Clearance...</div>
      </div>
    );
  }

  return (
    <AdminGatekeeper>
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row pt-20 md:pt-0">
        
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-[100] w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block shadow-2xl`}>
          
          <div className="h-20 flex items-center px-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-tacsfon-neonGreen tracking-wider">LIBRARIAN<span className="text-white">DESK</span></h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden ml-auto text-gray-400"><X /></button>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-80px)]">
            <div>
              <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Overview</p>
              <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
              <NavItem id="inventory" label="Book Inventory" icon={BookOpen} />
              <NavItem id="inbox" label="Inbox Messages" icon={MessageSquare} />
              <NavItem id="settings" label="Security Settings" icon={Lock} />
            </div>

            <div>
              <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Actions</p>
              {/* ✅ UPDATE 3: Added Loan Manager Link Here */}
              <NavItem link="/admin/loans" label="Loan Manager" icon={ClipboardList} />
              
              <NavItem link="/admin/academic-hub" label="Academic Hub" icon={Folder} />
              <NavItem link="/admin/upload-media" label="Media Manager" icon={UploadCloud} />
              
              <div className="border-t border-gray-800 my-2 pt-2"></div>
              <NavItem link="/admin/add-book" label="Add New Book" icon={PlusCircle} />
              <NavItem link="/admin/import-books" label="Book Hunter (Import)" icon={Globe} />
            </div>

            <div className="pt-8 border-t border-gray-800">
               <button onClick={() => router.push('/')} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors w-full">
                  <LogOut size={20} /> <span>Exit Admin</span>
               </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-[calc(100vh-80px)] md:h-screen overflow-hidden">
          
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between md:hidden shrink-0 sticky top-0 z-40 shadow-md">
             <span className="font-bold text-gray-800">Admin Panel</span>
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"><Menu size={24} /></button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            
            {loading && !books.length && activeTab !== 'settings' ? (
                <div className="flex h-full items-center justify-center text-gray-400">Loading Data...</div>
            ) : (
                <>
                    {/* TAB: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                      <div className="space-y-6 animate-fade-in">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Book Requests</h2>
                          {requests.length === 0 ? (
                              <div className="bg-white p-12 rounded-3xl text-center text-gray-400 border border-gray-100">
                                  <BookOpen size={40} className="mx-auto mb-2 opacity-20"/>
                                  <p>No pending borrow requests.</p>
                              </div>
                          ) : (
                              requests.map(req => (
                                  <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                      <div>
                                          <h3 className="font-bold text-lg text-gray-800">{req.book_title}</h3>
                                          <p className="text-sm text-gray-500">
                                              Requested by: <span className="font-bold text-gray-700">{req.student_email}</span>
                                          </p>
                                          <p className="text-xs text-gray-400 mt-1">{new Date(req.request_date).toLocaleDateString()}</p>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => handleRequestAction(req.id, 'Reject', req.book_id)} className="px-4 py-2 border border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50 text-sm">Reject</button>
                                          <button onClick={() => handleRequestAction(req.id, 'Approve', req.book_id)} className="px-6 py-2 bg-tacsfon-green text-white rounded-xl font-bold shadow-md hover:bg-green-700 text-sm">Approve Loan</button>
                                      </div>
                                  </div>
                              ))
                          )}
                          
                          <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex justify-between items-center">
                              <div>
                                  <h4 className="font-bold text-blue-900">Manage Active Loans</h4>
                                  <p className="text-sm text-blue-600">Go to the full Loan Manager to track returns.</p>
                              </div>
                              <Link href="/admin/loans" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-50">Open Manager</Link>
                          </div>
                      </div>
                    )}

                    {/* TAB: INVENTORY */}
                    {activeTab === 'inventory' && (
                       <div className="animate-fade-in">
                          <div className="flex justify-between items-center mb-6">
                              <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
                              <Link href="/admin/add-book" className="bg-tacsfon-orange text-white px-3 py-2 rounded-xl font-bold text-xs md:text-sm shadow-md flex items-center gap-2">
                                  <PlusCircle size={16}/> Add New
                              </Link>
                          </div>
                          
                          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                              <div className="overflow-x-auto">
                                  <table className="w-full text-left">
                                      <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold"><tr><th className="p-4">Book</th><th className="p-4">Stock</th><th className="p-4 text-right">Action</th></tr></thead>
                                      <tbody className="divide-y divide-gray-100">
                                          {books.map(book => (
                                              <tr key={book.id}>
                                                  <td className="p-4 font-bold flex items-center gap-3 min-w-[200px]">
                                                      <div className="w-8 h-12 bg-gray-200 rounded overflow-hidden shrink-0">
                                                          {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-300"></div>}
                                                      </div>
                                                      <div className="line-clamp-1">{book.title}</div>
                                                  </td>
                                                  <td className="p-4">
                                                      <span className={`px-2 py-1 rounded text-xs font-bold ${book.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                          {book.available_copies} Copies
                                                      </span>
                                                  </td>
                                                  <td className="p-4 text-right">
                                                      <div className="flex items-center justify-end gap-2">
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

                    {/* TAB: INBOX */}
                    {activeTab === 'inbox' && (
                       <div className="space-y-6 animate-fade-in">
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Inbox</h2>
                          {messages.length === 0 ? <p className="text-gray-400">No messages.</p> : (
                              <div className="grid gap-4">
                                  {messages.map(msg => (
                                      <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                          <h3 className="font-bold">{msg.name}</h3>
                                          <p className="text-gray-600 mt-2">{msg.message}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                       </div>
                    )}

                    {/* TAB: SETTINGS */}
                    {activeTab === 'settings' && (
                        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in mt-10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Lock className="text-tacsfon-green"/> Security</h2>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Update Passkey</label>
                                <div className="flex gap-4">
                                    <input type="text" id="newPasskey" placeholder="New Passkey" className="flex-1 p-3 rounded-xl border border-gray-200 outline-none focus:border-tacsfon-green font-mono" />
                                    <button 
                                        onClick={async () => {
                                            const val = (document.getElementById('newPasskey') as HTMLInputElement).value;
                                            if(!val) return alert("Enter a value!");
                                            await supabase.from('admin_settings').update({ setting_value: val }).eq('setting_key', 'admin_passkey');
                                            alert("Passkey Updated!");
                                        }}
                                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

          </div>
        </main>
      </div>
    </AdminGatekeeper>
  );
}