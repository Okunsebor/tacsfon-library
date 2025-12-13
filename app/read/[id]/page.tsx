'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader } from 'lucide-react';

export default function BookReader() {
  const { id } = useParams();
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      const { data, error } = await supabase
        .from('books')
        .select('pdf_url, title')
        .eq('id', id)
        .single();

      if (data && data.pdf_url) {
        setPdfUrl(data.pdf_url);
      }
      setLoading(false);
    }
    fetchBook();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><Loader className="animate-spin" /> Loading Book...</div>;
  
  if (!pdfUrl) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
      <p>This book does not have a digital version available.</p>
      <button onClick={() => router.back()} className="text-tacsfon-neonGreen hover:underline">Go Back</button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* HEADER */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
           <ArrowLeft size={20} /> <span className="text-sm font-bold">Back to Library</span>
        </button>
        <span className="text-sm font-bold text-tacsfon-neonOrange uppercase tracking-widest">Reading Mode</span>
        <div className="w-20"></div> {/* Spacer */}
      </div>

      {/* PDF VIEWER (Using Browser Native Embed) */}
      <iframe 
        src={pdfUrl} 
        className="flex-grow w-full border-none bg-white"
        title="PDF Reader"
      />
    </div>
  );
}