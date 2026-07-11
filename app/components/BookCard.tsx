import { Book } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  showRating?: boolean;
  orangeTheme?: boolean;
  hoverOffsetClass?: string;
  imgSizes?: string;
}

export default function BookCard({ 
  book, 
  showRating = false, 
  orangeTheme = false,
  hoverOffsetClass = 'group-hover:translate-y-[-5px]',
  imgSizes = '(max-width: 768px) 150px, (max-width: 1200px) 200px, 20vw'
}: BookCardProps) {
  const isPlaceholder = !book.cover_url;
  const imageUrl = book.cover_url || `https://placehold.co/400x600?text=${encodeURIComponent(book.title.substring(0, 10))}`;

  return (
    <Link href={`/book/${book.id}`} className="group block h-full">
      <div className={`relative aspect-[2/3] bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-100 group-hover:shadow-2xl transition-all duration-300 ${hoverOffsetClass} ${showRating ? 'mb-3' : 'mb-4'}`}>
        <Image 
          src={imageUrl} 
          alt={book.title}
          fill 
          unoptimized={isPlaceholder}
          sizes={imgSizes}
          className="object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span 
            className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
            style={orangeTheme ? { background: '#F7941D' } : undefined}
          >
            {orangeTheme ? 'Read' : 'Read Now'}
          </span>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-tacsfon-green transition-colors line-clamp-2 text-sm md:text-base">
        {book.title}
      </h3>
      <p className="text-xs text-gray-500 font-medium line-clamp-1">
        {book.author}
      </p>
      
      {showRating && (
        <div className="flex items-center gap-1 mt-1">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-gray-400 font-medium">4.5</span>
        </div>
      )}
    </Link>
  );
}
