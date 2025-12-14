'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader, BookOpen, Wifi } from 'lucide-react';

export default function BookReader() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      const { data } = await supabase
        .from('books')
        .select('title, pdf_url, ia_id') 
        .eq('id', id)
        .single();

      setBook(data);
      setLoading(false);
    }
    fetchBook();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><Loader className="animate-spin" /> Loading Library...</div>;
  
  // --- THE SMART LOGIC ---
  const pdfUrl = book?.pdf_url;
  const iaId = book?.ia_id;

  // 1. Check if it is a Google Drive Link
  const isGoogleDrive = pdfUrl && (pdfUrl.includes('drive.google.com') || pdfUrl.includes('docs.google.com'));
  
  // 2. If yes, convert it to "Preview Mode" (The Cleaner View)
  let embedUrl = pdfUrl;
  if (isGoogleDrive) {
     // Extract ID and force preview mode
     const driveIdMatch = pdfUrl.match(/\/d\/(.*?)\//);
     if (driveIdMatch) {
        embedUrl = `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
     }
  }

  // 3. Check if it is Internet Archive (Backup)
  const isInternetArchive = iaId && !pdfUrl; 

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* HEADER */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between shrink-0">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
           <ArrowLeft size={20} /> <span className="text-sm font-bold">Back</span>
        </button>
        <span className="text-sm font-bold text-tacsfon-neonOrange uppercase tracking-widest line-clamp-1">{book?.title}</span>
        <div className="w-10"></div>
      </div>

      {/* VIEWER SECTION */}
      <div className="flex-grow w-full bg-black relative">
        
        {/* OPTION A: HOSTED PDF or GOOGLE DRIVE (The "Switch") */}
        {pdfUrl ? (
           <iframe 
             src={embedUrl} 
             className="w-full h-full border-none"
             title="Digital Reader"
             allow="autoplay"
           />
        ) : isInternetArchive ? (
        
        /* OPTION B: INTERNET ARCHIVE (The "Bait" - Only for Green books) */
           <iframe 
             src={`https://archive.org/embed/${iaId}`} 
             className="w-full h-full border-none"
             title="Internet Archive Reader"
             allowFullScreen
           />
        ) : (
           /* OPTION C: EMPTY */
           <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <BookOpen size={48} className="opacity-20" />
              <p>No digital version attached.</p>
           </div>
        )}
      </div>
    </div>
  );
}