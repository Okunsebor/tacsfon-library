'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Send, Wifi, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import { useParams, useRouter } from 'next/navigation';

export default function BookDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    // 1. Get Student Info
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStudent(session.user);
        
        // Check for existing pending requests
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

    // 2. Fetch Book & Record History
    async function fetchBook() {
      const { data: bookData } = await supabase.from('books').select('*').eq('id', id).single();
      setBook(bookData);
      setLoading(false);

      // --- NEW: RECORD HISTORY AUTOMATICALLY ---
      if (bookData) {
         // Check if readable (Drive Link or Public)
         const isReadable = bookData.ebook_access === 'public' || bookData.pdf_url;
         
         if (isReadable) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Upsert: If exists, update timestamp. If new, insert.
                await supabase.from('reading_history').upsert({
                    user_email: session.user.email,
                    book_id: bookData.id,
                    last_read_at: new Date().toISOString()
                }, { onConflict: 'user_email, book_id' });
            }
         }
      }
    }
    fetchBook();
  }, [id]);

  // --- HELPER: CONVERT DRIVE LINKS TO EMBED LINKS ---
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('drive.google.com') && url.includes('/view')) {
      return url.replace(/\/view.*/, '/preview');
    }
    return url;
  };

  // HANDLER: Sends request to Librarian
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
      alert("Error sending request: " + error.message);
    } else {
      setRequestStatus(type);
      if(type === 'digital') alert("Digital Request Sent! The Librarian will send the PDF to your email.");
      else alert("Physical Request Sent! Please visit the library desk.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-tacsfon-green"></div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4"><AlertTriangle size={32}/></div>
      <h1 className="text-2xl font-bold text-gray-800">Book Not Found</h1>
      <Link href="/" className="mt-4 text-tacsfon-green hover:underline font-bold">Return Home</Link>
    </div>
  );

  // --- SMART DETECTION LOGIC ---
  const embedUrl = getEmbedUrl(book.pdf_url);
  const isInternetArchive = book.ebook_access === 'public';
  const isReadable = isInternetArchive || !!embedUrl; 

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb / Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-tacsfon-green font-bold mb-6 transition-colors">
          <ArrowLeft size={20} /> Back to Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* LEFT: COVER IMAGE */}
            <div className="w-full">
                <div className="aspect-[2/3] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative group">
                    <img 
                      src={book.cover_url || `https://placehold.co/400x600?text=${book.title.substring(0,10)}`} 
                      alt={book.title} 
                      className="w-full h-full object-cover" 
                    />
                </div>
            </div>

            {/* RIGHT: DETAILS & ACTIONS */}
            <div className="lg:col-span-2 flex flex-col">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-full">
                    
                    <div className="mb-6">
                         <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase rounded-full mb-4 ${isReadable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isReadable ? 'Digital Access: Available' : 'Digital Access: By Request Only'}
                         </span>
                         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{book.title}</h1>
                         <p className="text-xl text-gray-500 font-medium">{book.author}</p>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-2">Synopsis</h3>
                        <p className="text-gray-600 leading-relaxed text-lg font-light">
                            {book.description || book.summary || "No description available for this book. It is a valuable addition to the TACSFON library collection."}
                        </p>
                    </div>

                    {/* --- ACTION BUTTONS --- */}
                    <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                       
                       {/* 1. BUTTON: SMART READ BUTTON */}
                       {isReadable && (
                          embedUrl ? (
                            <a 
                              href="#reader-view"
                              className="w-full bg-gray-900 text-white hover:bg-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                              <BookOpen size={20} className="text-tacsfon-green" /> Read Now
                            </a>
                          ) : (
                            <Link 
                              href={`/read/${book.id}`}
                              className="w-full bg-gray-900 text-white hover:bg-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                              <BookOpen size={20} className="text-tacsfon-green" /> Read Digital Book
                            </Link>
                          )
                       )}

                       {/* 2. BUTTON: REQUEST DIGITAL (If NOT readable) */}
                       {!isReadable && (
                           requestStatus === 'digital' ? (
                             <button disabled className="w-full bg-blue-50 text-blue-500 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-blue-100">
                               <Send size={20} /> Digital Request Sent
                             </button>
                           ) : (
                             <button 
                               onClick={() => handleRequest('digital')}
                               className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                             >
                               <Wifi size={20} /> Request Digital Copy (Email)
                             </button>
                           )
                       )}

                       {/* 3. BUTTON: BORROW PHYSICAL */}
                       {requestStatus === 'physical' ? (
                         <button disabled className="w-full bg-orange-100 text-orange-600 font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                           <Clock size={20} /> Physical Request Pending
                         </button>
                       ) : (
                         <button 
                           onClick={() => handleRequest('physical')}
                           disabled={book.available_copies <= 0}
                           className="w-full bg-tacsfon-green hover:bg-[#00502b] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg"
                         >
                           {book.available_copies > 0 ? 'Borrow Physical Copy' : 'Physical Copy Out of Stock'}
                         </button>
                       )}

                    </div>
                </div>
            </div>
        </div>

        {/* --- READER SECTION (Only Shows if Drive PDF Exists) --- */}
        {embedUrl && (
            <div id="reader-view" className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden h-[85vh] flex flex-col animate-fade-in mb-12">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                       <BookOpen size={20} className="text-tacsfon-green"/> Reader View
                    </h3>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Digital Copy</span>
                </div>
                
                <iframe 
                    src={embedUrl} 
                    className="w-full h-full" 
                    allow="autoplay"
                ></iframe>
            </div>
        )}

      </main>
    </div>
  );
}