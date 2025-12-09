import BorrowButton from '@/app/components/BorrowButton';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Fetch the specific book
async function getBook(id: string) {
  const { data: book } = await supabase.from('books').select('*').eq('id', id).single();
  return book;
}

export default async function BookDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await params for Next.js 15+ support
  const book = await getBook(id);

  if (!book) return <div className="p-10 text-center">Book not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* Book Cover Area */}
        <div className="w-full md:w-1/3 bg-blue-900 flex items-center justify-center p-10">
           <div className="w-32 h-48 bg-gray-300 rounded shadow-md flex items-center justify-center text-gray-500">
             {book.cover_url ? <img src={book.cover_url} alt={book.title} /> : 'No Cover'}
           </div>
        </div>

        {/* Details Area */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">
            &larr; Back to Library
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <h2 className="text-xl text-blue-600 font-semibold mb-6">{book.author}</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-100 p-4 rounded-lg">
              <span className="block text-xs text-gray-500 uppercase">Category</span>
              <span className="font-medium">{book.category || 'General'}</span>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <span className="block text-xs text-gray-500 uppercase">Status</span>
              <span className={`font-bold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
              </span>
            </div>
          </div>

          <BorrowButton bookId={book.id} availableCopies={book.available_copies} />
        </div>

      </div>
    </div>
  );
}