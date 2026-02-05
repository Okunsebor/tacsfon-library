'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Send, Wifi, AlertTriangle, MessageSquare, User, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function BookDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);

  // --- UI STATES ---
  const [isExpanded, setIsExpanded] = useState(false); // For Read More toggle

  // --- COMMENT STATE ---
  const [comments, setComments] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStudent(session.user);
        const { data: request } = await supabase
          .from('borrow_requests')
          .select('*')
          .eq('book_id', id)
          .eq('student_email', session.user.email)
          .eq('status', 'Pending')
          .single();
        if (request) setRequestStatus(request.request_type);
      }
    }
    init();

    async function fetchBook() {
      const { data: bookData } = await supabase.from('books').select('*').eq('id', id).single();
      setBook(bookData);

      if (bookData) {
         const isReadable = bookData.ebook_access === 'public' || bookData.pdf_url;
         if (isReadable) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase.from('reading_history').upsert({
                    user_email: session.user.email,
                    book_id: bookData.id,
                    last_read_at: new Date().toISOString()
                }, { onConflict: 'user_email, book_id' });
            }
         }
      }
      setLoading(false);
    }
    fetchBook();
    fetchComments();
  }, [id]);

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*').eq('book_id', id).order('created_at', { ascending: false });
    if (data) setComments(data);
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('drive.google.com') && url.includes('/view')) {
      return url.replace(/\/view.*/, '/preview');
    }
    return url;
  };

  const handleRequest = async (type: 'physical' | 'digital') => {
    if (!student) {
      alert("Please log in as a student first.");
      router.push('/student-login');
      return;
    }
    const { error } = await supabase.from('borrow_requests').insert([{
      student_email: student.email,
      student_name: student.user_metadata?.full_name || student.email,
      book_id: book.id,
      book_title: book.title,
      status: 'Pending',
      request_type: type
    }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setRequestStatus(type);
      alert(type === 'digital' ? "Request Sent! Check your email soon." : "Request Sent! Visit the library desk.");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert([{ book_id: id, user_name: newName, content: newComment }]);
    if (!error) {
      setNewName('');
      setNewComment('');
      fetchComments(); 
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-400"></div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4"><AlertTriangle size={32}/></div>
      <h1 className="text-2xl font-bold text-gray-800">Book Not Found</h1>
      <Link href="/" className="mt-4 text-tacsfon-green hover:underline font-bold">Return Home</Link>
    </div>
  );

  const embedUrl = getEmbedUrl(book.pdf_url);
  const isInternetArchive = book.ebook_access === 'public';
  const isReadable = isInternetArchive || !!embedUrl; 
  const coverImage = book.cover_url || `https://placehold.co/400x600?text=${book.title.substring(0,10)}`;
  const description = book.description || book.summary || "No description available for this book.";

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-gray-900 selection:bg-green-500 selection:text-white">
      <Navbar />

      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gray-900">
             <Image 
                src={coverImage} alt="Background" fill 
                className="object-cover opacity-40 blur-[80px] scale-125" unoptimized
             />
          </div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white font-bold mb-8 transition-colors backdrop-blur-sm bg-black/10 px-4 py-2 rounded-full border border-white/10 hover:bg-black/20">
          <ArrowLeft size={18} /> Back to Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 md:gap-12 mb-16">
            
            {/* --- LEFT: FLOATING COVER (Solid - No Glass) --- */}
            <div className="w-full flex flex-col gap-6">
                <div className="relative aspect-[2/3] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group transform hover:scale-[1.02] transition-transform duration-500 bg-gray-800">
                    <img src={coverImage} alt={book.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>

                {/* Mobile Action Button */}
                <div className="lg:hidden">
                    {isReadable ? (
                        <a href="#reader-view" className="w-full bg-green-500 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/30">
                            <BookOpen size={20} /> Read Now
                        </a>
                    ) : (
                         <button onClick={() => handleRequest('physical')} disabled={book.available_copies <= 0} className="w-full bg-white text-gray-900 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                            Borrow Physical
                         </button>
                    )}
                </div>
            </div>

            {/* --- RIGHT: GLASS DETAILS CARD --- */}
            <div className="flex flex-col space-y-8">
                
                {/* 1. INFO CARD (More Transparent Glass) */}
                <div className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden transition-all hover:bg-white/65"
                     style={{ background: 'rgba(255, 255, 255, 0.6)' }} // ⚡ MORE TRANSPARENT (0.6 instead of 0.85)
                >
                    <div className="mb-6">
                         <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${isReadable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {isReadable ? 'Digital Access' : 'Physical Only'}
                            </span>
                            <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-white/50 text-gray-800 border border-white/20">
                                {book.category || 'General'}
                            </span>
                         </div>
                         <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 leading-tight tracking-tight">{book.title}</h1>
                         <p className="text-xl text-gray-700 font-medium">{book.author}</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen size={18} className="text-green-700"/> Synopsis
                        </h3>
                        
                        {/* ⚡ READ MORE LOGIC */}
                        <div className="relative">
                            <div 
    className={`text-gray-800 leading-relaxed text-lg font-normal transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''} [&>p]:mb-4`}
    dangerouslySetInnerHTML={{ __html: description }}
/>
                            
                            {/* Toggle Button (Only shows if text is long enough - simplified logic here) */}
                            {description.length > 150 && (
                                <button 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="mt-2 text-sm font-bold text-green-800 hover:text-green-600 flex items-center gap-1 transition-colors"
                                >
                                    {isExpanded ? (
                                        <>Show Less <ChevronUp size={14}/></>
                                    ) : (
                                        <>Read More <ChevronDown size={14}/></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DESKTOP ACTIONS */}
                    <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-gray-900/10">
                        {isReadable && (
                          embedUrl ? (
                            <a href="#reader-view" className="bg-gray-900 text-white hover:bg-black font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl">
                              <BookOpen size={20} className="text-green-400" /> Read Now
                            </a>
                          ) : (
                            <Link href={`/read/${book.id}`} className="bg-gray-900 text-white hover:bg-black font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl">
                              <BookOpen size={20} className="text-green-400" /> Read Digital Book
                            </Link>
                          )
                        )}

                        {!isReadable && (
                           requestStatus === 'digital' ? (
                             <button disabled className="bg-blue-50 text-blue-600 font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-blue-200">
                               <Send size={20} /> Request Sent
                             </button>
                           ) : (
                             <button onClick={() => handleRequest('digital')} className="bg-white border-2 border-white/50 text-gray-900 hover:bg-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm">
                               <Wifi size={20} /> Request PDF
                             </button>
                           )
                        )}

                        {requestStatus === 'physical' ? (
                          <button disabled className="bg-orange-100 text-orange-700 font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                            <Clock size={20} /> Pending
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleRequest('physical')}
                            disabled={book.available_copies <= 0}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-lg hover:shadow-green-500/30"
                          >
                            {book.available_copies > 0 ? 'Borrow Copy' : 'Out of Stock'}
                          </button>
                        )}
                    </div>
                </div>

                {/* 2. COMMENTS CARD (Transparent Glass) */}
                <div className="p-8 rounded-[2.5rem] shadow-xl border border-white/20 backdrop-blur-md"
                     style={{ background: 'rgba(255, 255, 255, 0.5)' }} // ⚡ EVEN MORE TRANSPARENT for comments
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageSquare size={20} className="text-green-700" />
                        Discussion <span className="px-2 py-0.5 bg-white/50 rounded-full text-xs text-gray-800 font-bold border border-white/20">{comments.length}</span>
                    </h3>

                    <form onSubmit={handlePostComment} className="mb-8 bg-white/40 p-1 rounded-2xl border border-white/40 focus-within:ring-2 focus-within:ring-green-400/30 transition-all shadow-inner">
                        <div className="flex flex-col gap-2 p-4">
                           <input 
                                type="text" required placeholder="Your Name"
                                className="w-full bg-transparent border-b border-gray-400/30 px-2 py-2 text-sm focus:outline-none font-bold text-gray-900 placeholder:text-gray-500"
                                value={newName} onChange={(e) => setNewName(e.target.value)}
                           />
                           <textarea 
                                required placeholder="What are your thoughts on this book?" rows={2}
                                className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none resize-none text-gray-800 placeholder:text-gray-500"
                                value={newComment} onChange={(e) => setNewComment(e.target.value)}
                           />
                        </div>
                        <div className="flex justify-end bg-white/30 p-2 rounded-xl mt-1">
                            <button 
                                type="submit" disabled={submitting}
                                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 hover:shadow-lg"
                            >
                                {submitting ? 'Posting...' : <>Post <Send size={14} /></>}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {comments.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-300 italic text-sm">No comments yet. Be the first.</p>
                            </div>
                        ) : (
                            comments.map((c) => (
                                <div key={c.id} className="flex gap-4 p-4 rounded-2xl bg-white/40 border border-white/30 hover:bg-white/60 transition-colors shadow-sm">
                                    <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-600 shrink-0 shadow-sm font-bold">
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-gray-900 text-sm">{c.user_name}</h4>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-800 text-sm leading-relaxed font-medium">{c.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>

        {/* --- READER VIEW --- */}
        {embedUrl && (
            <div id="reader-view" className="rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden h-[85vh] flex flex-col backdrop-blur-xl bg-white/80 animate-fade-in mb-12 relative z-20">
                <div className="p-4 border-b border-gray-200/50 bg-white/40 flex justify-between items-center backdrop-blur-md">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen size={20} className="text-green-700"/> Reader View
                    </h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md">Secure Viewer</span>
                    </div>
                </div>
                <iframe src={embedUrl} className="w-full h-full bg-white" allow="autoplay"></iframe>
            </div>
        )}

      </main>
    </div>
  );
}