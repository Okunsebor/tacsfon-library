'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console (or a service like Sentry in the future)
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6 animate-bounce">
        <AlertTriangle size={48} className="text-red-500" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Something went wrong!</h2>
      
      <p className="text-gray-500 mb-8 max-w-md text-sm leading-relaxed">
        We encountered an unexpected issue while loading this page. It might be a network glitch.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 bg-tacsfon-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 hover:-translate-y-1"
        >
          <RefreshCcw size={18} />
          Try Again
        </button>
        
        <Link 
          href="/"
          className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
        >
          <Home size={18} />
          Go Home
        </Link>
      </div>
    </div>
  );
}