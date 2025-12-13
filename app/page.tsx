'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen } from 'lucide-react';

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    // 1. Check if a student is logged in
    const savedStudent = localStorage.getItem('tacsfonStudent');
    if (savedStudent) {
      setStudent(JSON.parse(savedStudent));
    }

    // 2. Fetch Books
    async function fetchBooks() {
      const { data, error } = await supabase.from('books').select('*');
      if (error) console.error(error);
      else setBooks(data || []);
      setLoading(false);
    }
    fetchBooks();
  }, []);

  const categories = [...new Set(books.map(b => b.category || 'Uncategorized'))];

  // FILTER LOGIC: Find books that match student interests
  const recommendedBooks = student 
    ? books.filter(b => (student.interests || []).includes(b.category) || student.department === b.category)
    : [];

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 pt-12 space-y-8 animate-pulse">
      <div className="h-96 bg-gray-200 rounded-2xl mx-auto mb-16"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl"></div>)}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* HERO SECTION */}
      <div className="relative bg-gray-900 h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('/library-hero.jpg')" }}></div>
        {/* Neon Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-gray-900"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center animate-fade-in z-10">
          {student ? (
            // PERSONALIZED WELCOME
            <>
              <span className="inline-block px-4 py-1 rounded-full bg-tacsfon-neonGreen/20 text-tacsfon-neonGreen border border-tacsfon-neonGreen font-bold text-xs uppercase mb-4 tracking-widest shadow-[0_0_10px_#00FF88]">
                 Verified Student Access
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight">
                Welcome Back, <span className="text-tacsfon-neonOrange">{student.full_name || 'Scholar'}</span>
              </h1>
              <p className="text-gray-300 text-xl font-light max-w-2xl mx-auto mb-8">
                We've curated resources for <strong>{student.department}</strong> and your interests.
              </p>
            </>
          ) : (
            // GUEST WELCOME
            <>
              <span className="text-tacsfon-orange font-bold tracking-widest text-sm uppercase mb-4 block">Official Archive</span>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-tight">
                Welcome to <span className="text-tacsfon-orange">TACSFON</span> Library
              </h1>
              <p className="text-gray-200 text-xl font-light max-w-2xl mx-auto mb-10">
                Bridging the gap between spiritual depth and academic excellence.
              </p>
              <Link href="/student-login" className="inline-block bg-tacsfon-orange hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105 shadow-lg">
                Student Login
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        
        {/* 1. RECOMMENDED SECTION (Only if Student is logged in) */}
        {student && recommendedBooks.length > 0 && (
          <section className="animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="text-tacsfon-neonOrange" size={28} />
              <h2 className="text-3xl font-bold text-gray-800">Top Picks for You</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {recommendedBooks.map((book) => (
                <Link href={`/book/${book.id}`} key={book.id} className="group block h-full">
                  <div className="bg-white rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-tacsfon-neonGreen/50 h-full flex flex-col overflow-hidden relative">
                    
                    {/* COVER IMAGE */}
                    <div className="h-64 overflow-hidden relative bg-gray-100">
                        <img 
                          src={book.cover_url || "https://placehold.co/400x600?text=No+Cover"} 
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2 bg-tacsfon-neonOrange text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
                          MATCH
                        </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-tacsfon-green transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mb-3">{book.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 2. ALL COLLECTIONS */}
        {categories.map((category) => (
          <section key={category}>
            <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
              <div className="flex-1"></div>
              <Link href="#" className="text-sm font-bold text-tacsfon-green hover:underline flex items-center gap-1">
                View All <BookOpen size={16}/>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {books
                .filter(book => (book.category || 'Uncategorized') === category)
                .map((book) => (
                  <Link href={`/book/${book.id}`} key={book.id} className="group block h-full">
                    <div className="bg-white rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-100 h-full flex flex-col overflow-hidden relative">
                      
                      {/* COVER IMAGE */}
                      <div className="h-64 overflow-hidden relative bg-gray-100">
                          <img 
                            src={book.cover_url || "https://placehold.co/400x600?text=No+Cover"} 
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          {/* Dark overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      </div>

                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-tacsfon-green transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium mb-4">{book.author}</p>
                        
                        {/* Status Badge */}
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                           <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${book.available_copies > 0 ? 'bg-green-50 text-tacsfon-green' : 'bg-red-50 text-red-500'}`}>
                              {book.available_copies > 0 ? 'Available' : 'Taken'}
                           </span>
                        </div>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}