import { supabase } from '@/lib/supabaseClient';

// This function runs on the server to fetch data before the page loads
export default async function Home() {
  
  // 1. Fetch data from Supabase
  const { data: books, error } = await supabase.from('books').select('*');

  // 2. Handle potential errors
  if (error) {
    console.error("Error fetching books:", error);
  }

  // 3. Render the HTML
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 text-black">
      <h1 className="text-4xl font-bold mb-8 text-blue-900">TACSFON Library</h1>
      
      {/* Grid Layout for Books */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {books?.map((book) => (
          <div key={book.id} className="bg-white border p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold mb-2">{book.title}</h2>
            <p className="text-gray-600 mb-4">by {book.author}</p>
            
            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <span className={`text-sm font-semibold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
              </span>
              <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">
                Borrow
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}