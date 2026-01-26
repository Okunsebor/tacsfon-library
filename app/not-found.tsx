import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-tacsfon-green/20 rounded-full blur-xl animate-pulse"></div>
        <FileQuestion size={80} className="text-tacsfon-green relative z-10" />
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or is currently under construction.
      </p>

      <Link 
        href="/"
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all hover:scale-105"
      >
        <ArrowLeft size={20} />
        Back to Library
      </Link>
    </div>
  );
}