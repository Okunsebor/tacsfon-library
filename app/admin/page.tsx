'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Plus, Trash2, LogOut, Mail, CheckCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const [books, setBooks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'messages'
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // 1. Fetch Books
    const { data: booksData } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    setBooks(booksData || []);

    // 2. Fetch Messages
    const { data: messagesData } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages(messagesData || []);
    
    setLoading(false);
  }

  // Mark a message as "Read" or "Resolved"
  const toggleMessageStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
    
    // Update local state instantly for UI speed
    setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));

    // Update database
    await supabase.from('contact_messages').update({ status: newStatus }).eq('id', id);
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    await supabase.from('books').delete().eq('id', id);
    fetchData(); // Refresh list
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="p-10 text-center text-tacsfon-green font-bold">Loading Portal...</div>;

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:block z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-tacsfon-green">Librarian Portal</h2>
          <p className="text-xs text-gray-400 mt-1">Manage Resources</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('books')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'books' ? 'bg-tacsfon-green text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <BookOpen size={20} />
            <span className="font-medium">Library Books</span>
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${activeTab === 'messages' ? 'bg-tacsfon-green text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Mail size={20} />
            <span className="font-medium">Inbox</span>
            {unreadCount > 0 && (
              <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 w-full px-4 py-3 rounded-xl transition-all font-medium">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8">
        
        {/* TOP HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'books' ? 'Book Collection' : 'Student Messages'}
            </h1>
            <p className="text-sm text-gray-500">
              {activeTab === 'books' ? `${books.length} books in total` : `You have ${unreadCount} unread messages`}
            </p>
          </div>
          
          {activeTab === 'books' && (
            <button 
              onClick={() => router.push('/admin/add-book')}
              className="bg-tacsfon-orange hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 transition-all"
            >
              <Plus size={20} /> Add New Book
            </button>
          )}
        </header>

        {/* CONTENT SWITCHER */}
        {activeTab === 'books' ? (
          /* BOOK LIST VIEW */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-sm font-bold text-gray-500">Title</th>
                  <th className="p-4 text-sm font-bold text-gray-500">Author</th>
                  <th className="p-4 text-sm font-bold text-gray-500">Category</th>
                  <th className="p-4 text-sm font-bold text-gray-500">Stock</th>
                  <th className="p-4 text-sm font-bold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{book.title}</td>
                    <td className="p-4 text-gray-600">{book.author}</td>
                    <td className="p-4">
                      <span className="bg-green-50 text-tacsfon-green text-xs font-bold px-2 py-1 rounded-full border border-green-100">
                        {book.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className={book.available_copies > 0 ? "text-tacsfon-green font-bold" : "text-red-500 font-bold"}>
                        {book.available_copies}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteBook(book.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (
          /* MESSAGES INBOX VIEW */
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <Mail size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No messages yet.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`bg-white p-6 rounded-2xl border transition-all ${msg.status === 'unread' ? 'border-l-4 border-l-tacsfon-orange shadow-md' : 'border-gray-100 opacity-75'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${msg.status === 'unread' ? 'bg-tacsfon-green' : 'bg-gray-300'}`}>
                        {msg.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{msg.name}</h3>
                        <p className="text-xs text-gray-500">{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => toggleMessageStatus(msg.id, msg.status)}
                        className={`p-2 rounded-full transition-colors ${msg.status === 'unread' ? 'text-gray-300 hover:text-tacsfon-green hover:bg-green-50' : 'text-tacsfon-green bg-green-50'}`}
                        title={msg.status === 'unread' ? "Mark as Read" : "Mark as Unread"}
                      >
                        {msg.status === 'unread' ? <Clock size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="pl-13 ml-12 border-l-2 border-gray-100 pl-4">
                    <h4 className="font-bold text-gray-700 text-sm mb-1">{msg.subject || 'No Subject'}</h4>
                    <p className="text-gray-600 leading-relaxed text-sm">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}