'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Send, Wifi, Download } from 'lucide-react';
import Link from 'next/link';
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
    const savedStudent = localStorage.getItem('tacsfonStudent');
    if (savedStudent) setStudent(JSON.parse(savedStudent));

    // 2. Fetch Book
    async function fetchData() {
      const { data: bookData } = await supabase.from('books').select('*').eq('id', id).single();
      setBook(bookData);

      // Check for existing pending requests
      if (savedStudent && bookData) {
        const parsedStudent = JSON.parse(savedStudent);
        const { data: request } = await supabase
          .from('borrow_requests')
          .select('*')
          .eq('book_id', id)
          .eq('student_email', parsedStudent.email)
          .eq('status', 'Pending')
          .single();
        
        if (request) setRequestStatus(request.request_type); // 'physical' or 'digital'
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  // HANDLER: Sends request to Librarian
  const handleRequest = async (type: 'physical' | 'digital') => {
    if (!student) {
      alert("Please log in as a student first.");
      router.push('/student-login');
      return;
    }

    const { error } = await supabase.from('borrow_requests').insert([{
      student_email: student.email,
      student_name: student.full_name,
      book_id: book.id,
      book_title: book.title,
      status: 'Pending',
      request_type: type // <--- SAVING THE TYPE (Physical or Digital)
    }]);

    if (error) {
      alert("Error sending request.");
    } else {
      setRequestStatus(type);
      if(type === 'digital') alert("Digital Request Sent! The Librarian will send the PDF to your email.");
      else alert("Physical Request Sent! Please visit the library desk.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!book) return <div className="min-h-screen flex items-center justify-center">Book not found.</div>;

  // --- SMART DETECTION LOGIC ---
  // A book is "Readable" if it is Public OR if you manually added a PDF link (Google Drive)
  const isReadable = book.ebook_access === 'public' || book.pdf_url;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-tacsfon-green mb-8 font-bold text-sm uppercase">
          <ArrowLeft size={18} /> Back to Shelves
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          {/* Cover Image */}
          <div className="w-full md:w-1/3 bg-gray-100 relative">
             <img src={book.cover_url || "https://placehold.co/400x600?text=No+Cover"} alt={book.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col">
             <div className="mb-6">
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase rounded-full mb-4 ${isReadable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {isReadable ? 'Digital Access: Available' : 'Digital Access: By Request Only'}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-500 font-medium">{book.author}</p>
             </div>

             <div className="mb-8 flex-grow">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">Synopsis</h3>
                <p className="text-gray-600 leading-relaxed text-lg font-light">{book.summary || "No summary available."}</p>
             </div>

             {/* --- THE THREE SMART BUTTONS --- */}
             <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
               
               {/* BUTTON 1: READ NOW (Only if Public or Manual PDF) */}
               {isReadable && (
                 <Link 
                   href={`/read/${book.id}`}
                   className="w-full bg-gray-900 text-white hover:bg-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                 >
                   <BookOpen size={20} className="text-tacsfon-neonGreen" /> Read Digital Book
                 </Link>
               )}

               {/* BUTTON 2: REQUEST DIGITAL (Always Visible - The "Grey Zone" Strategy) */}
               {requestStatus === 'digital' ? (
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
               )}

               {/* BUTTON 3: BORROW PHYSICAL (Standard) */}
               {requestStatus === 'physical' ? (
                 <button disabled className="w-full bg-orange-100 text-tacsfon-orange font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                   <Clock size={20} /> Physical Request Pending
                 </button>
               ) : (
                 <button 
                   onClick={() => handleRequest('physical')}
                   disabled={book.available_copies <= 0}
                   className="w-full bg-tacsfon-green hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg"
                 >
                   {book.available_copies > 0 ? 'Borrow Physical Copy' : 'Physical Copy Out of Stock'}
                 </button>
               )}

             </div>
          </div>
        </div>
      </div>
    </main>
  );
}