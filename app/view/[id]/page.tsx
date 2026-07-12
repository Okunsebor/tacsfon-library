'use client';

import { useParams } from 'next/navigation';
import { Loader2, AlertTriangle, ArrowLeft, FileQuestion } from 'lucide-react';
import { useBook } from '@/features/books/hooks/useBook';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DocumentViewer() {
  const { id } = useParams();
  const bookId = Array.isArray(id) ? id[0] : id;
  const { book, loading } = useBook(bookId);
  const [urlStatus, setUrlStatus] = useState<'pending' | 'ok' | 'error'>('pending');

  const pdfUrl = book?.pdf_url || undefined;
  const iaId = book?.ia_id || undefined;
  
  let embedUrl = pdfUrl;
  if (pdfUrl && pdfUrl.includes('drive.google.com')) {
    const m = pdfUrl.match(/\/d\/(.*?)\//);
    if (m) embedUrl = `https://drive.google.com/file/d/${m[1]}/preview`;
  }
  
  const hasEmbed = !!embedUrl;
  const hasIA = !!(iaId && !pdfUrl);

  useEffect(() => {
    let isMounted = true;

    async function checkUrl() {
      if (!hasEmbed) {
        if (isMounted) setUrlStatus('ok'); // IA or nothing, skip check
        return;
      }
      try {
        const res = await fetch(embedUrl!, { method: 'HEAD' });
        if (!isMounted) return;
        if (res.ok) {
          setUrlStatus('ok');
        } else {
          setUrlStatus('error');
        }
      } catch (err) {
        // If fetch fails (CORS or network), assume error or let iframe handle it. 
        // We'll lean towards showing the custom error.
        if (isMounted) setUrlStatus('error');
      }
    }

    if (book && !loading) {
      checkUrl();
    }

    return () => { isMounted = false; };
  }, [embedUrl, hasEmbed, book, loading]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
        <p className="font-medium text-gray-400">Loading document viewer...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
        <AlertTriangle size={48} className="text-red-500" />
        <h1 className="text-2xl font-bold">Document Not Found</h1>
        <Link href="/" className="text-green-400 hover:underline">Return to Library</Link>
      </div>
    );
  }

  if (!hasEmbed && !hasIA) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4 p-8 text-center">
        <AlertTriangle size={48} className="text-yellow-500" />
        <h1 className="text-2xl font-bold">No digital version available</h1>
        <p className="text-gray-400">This book does not have a PDF or digital copy uploaded yet.</p>
        <Link href={`/book/${bookId}`} className="text-green-400 hover:underline mt-4">Return to Book Details</Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      <div className="h-14 bg-gray-950 flex items-center justify-between px-4 shadow-md border-b border-white/10 shrink-0">
        <div className="flex-1 flex justify-start">
            <Link href={`/book/${bookId}`} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <ArrowLeft size={20} />
                <span className="font-medium text-sm hidden sm:inline">Back to Book</span>
            </Link>
        </div>
        <div className="flex-1 text-center truncate px-4">
            <span className="font-bold text-white text-sm truncate">{book.title}</span>
        </div>
        <div className="flex-1"></div>
      </div>
      <div className="flex-1 w-full bg-[#323639] relative">
        {urlStatus === 'pending' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#323639] text-white z-10">
            <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
            <p className="font-medium text-gray-400">Locating document...</p>
          </div>
        )}
        
        {urlStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10 p-8 text-center">
            <FileQuestion size={64} className="text-red-500 mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Document Unavailable</h2>
            <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
              We couldn't locate the file for this book. It may have been removed or the link is broken. 
            </p>
            <div className="p-4 bg-gray-800 rounded-lg text-sm text-gray-500 font-mono break-all max-w-2xl border border-gray-700">
              Debug URL: {embedUrl}
            </div>
          </div>
        )}

        {urlStatus === 'ok' && (
          <iframe
            src={hasEmbed ? embedUrl : `https://archive.org/embed/${iaId}`}
            className="w-full h-full border-none"
            title={book.title}
            allow="autoplay"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
