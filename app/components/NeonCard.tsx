import Link from 'next/link';
import { Book } from 'lucide-react';

export default function NeonCard({ book }: { book: any }) {
  const isAvailable = book.available_copies > 0;
  
  return (
    <Link href={`/book/${book.id}`} className="group block h-full">
      <div className="glass-panel rounded-2xl p-4 h-full flex flex-col transition duration-300 hover:bg-white/10 hover:-translate-y-2 border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
        
        {/* Cover Image Placeholder */}
        <div className="aspect-[2/3] mb-4 rounded-xl overflow-hidden bg-gray-900/50 relative flex items-center justify-center border border-white/5">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
          ) : (
            <Book size={48} className="text-gray-600 group-hover:text-cyan-400 transition duration-300" />
          )}
          
          {/* Status Badge */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
            ${isAvailable ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {isAvailable ? 'Available' : 'Taken'}
          </div>
        </div>
        
        {/* Book Details - FORCED WHITE TEXT */}
        <div className="mt-auto">
          <h3 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-2 group-hover:text-cyan-300 transition">
            {book.title}
          </h3>
          <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
            {book.author}
          </p>
        </div>

      </div>
    </Link>
  );
}