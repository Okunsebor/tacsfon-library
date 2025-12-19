'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { Search, BookOpen, ArrowRight, Folder, Video, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- SLIDER CONFIGURATION ---
  const slides = [
    {
      id: 1,
      image: "/slide1.jpg", 
      title: "WELCOME TO TACSFON LIBRARY",
      subtitle: "Empowering Academic Excellence & Spiritual Depth",
      cta: "Explore Resources",
      link: "#collections"
    },
    {
      id: 2,
      image: "/slide2.jpg", 
      title: "RAISING GIANTS",
      subtitle: "Access thousands of spiritual books and sermons meant to build your stature in Christ.",
      cta: "Browse Sermons",
      link: "/media"
    },
    {
      id: 3,
      image: "/slide3.jpg", 
      title: "A COMMUNITY OF INTELLECTUALS",
      subtitle: "Join the movement of students who excel in both their studies and their walk with God.",
      cta: "Let's Connect",
      link: "/contact"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  useEffect(() => {
    async function fetchBooks() {
      const { data, error } = await supabase.from('books').select('*').order('title', { ascending: true });
      if (error) console.error(error);
      else setBooks(data || []);
    }
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  // --- 🧠 SUPER SMART SORTER (Author + Keyword Intelligence) ---
  const smartCategorize = (book: any) => {
    // 0. Priority: If Admin manually set a category, respect it.
    if (book.category && book.category !== 'General Collection' && book.category !== 'General') {
        return book.category;
    }

    const text = (book.title + " " + (book.summary || "")).toLowerCase();
    const author = (book.author || "").toLowerCase();

    // 1. AUTHOR INTELLIGENCE (Check Authors First)
    // Spiritual Giants
    if (author.includes('hagin') || author.includes('oyedepo') || author.includes('adeboye') || 
        author.includes('kumuyi') || author.includes('selman') || author.includes('watchman nee') || 
        author.includes('spurgeon') || author.includes('copeland') || author.includes('prince') ||
        author.includes('omartian') || author.includes('c.s. lewis') || author.includes('piper') ||
        author.includes('lucado') || author.includes('katherine kuhlman') || author.includes('benny hinn')) {
        return 'Spiritual Growth';
    }
    
    // Leadership Experts
    if (author.includes('maxwell') || author.includes('sinek') || author.includes('covey') || 
        author.includes('carnegie') || author.includes('myles munroe')) {
        // Myles Munroe writes both, but often Leadership/Kingdom
        if(text.includes('prayer') || text.includes('spirit')) return 'Spiritual Growth'; 
        return 'Leadership';
    }

    // Finance/Business Gurus
    if (author.includes('kiyosaki') || author.includes('buffett') || author.includes('dangote') || 
        author.includes('osuntokun') || author.includes('ramsey')) {
        return 'Finance & Career';
    }

    // Relationship Experts
    if (author.includes('chapman') || author.includes('kris vallotton')) {
        return 'Relationships';
    }

    // 2. KEYWORD INTELLIGENCE (Fallback if Author is unknown)
    if (text.includes('leader') || text.includes('influence') || text.includes('laws') || text.includes('habit') || text.includes('strategy')) return 'Leadership';
    if (text.includes('prayer') || text.includes('god') || text.includes('spirit') || text.includes('jesus') || text.includes('faith') || text.includes('bible') || text.includes('gospel') || text.includes('church') || text.includes('devotional') || text.includes('holiness')) return 'Spiritual Growth';
    if (text.includes('money') || text.includes('finance') || text.includes('rich') || text.includes('wealth') || text.includes('business') || text.includes('economy') || text.includes('invest')) return 'Finance & Career';
    if (text.includes('physics') || text.includes('chem') || text.includes('math') || text.includes('calculus') || text.includes('program') || text.includes('code') || text.includes('python') || text.includes('engineer') || text.includes('biology') || text.includes('statistic') || text.includes('law')) return 'Academic';
    if (text.includes('love') || text.includes('marriage') || text.includes('dating') || text.includes('sex') || text.includes('courtship')) return 'Relationships';
    
    // 3. Fallback
    return 'General Collection';
  };

  // --- GROUPING LOGIC ---
  const categories = books.reduce((acc, book) => {
    let catRaw = smartCategorize(book);
    const cat = catRaw.charAt(0).toUpperCase() + catRaw.slice(1).toLowerCase(); // Normalize case

    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(book);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedCategoryNames = Object.keys(categories).sort();

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* --- HERO SLIDESHOW SECTION --- */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-gray-900 text-white">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 bg-black/60 z-10" /> 
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover transform scale-105 animate-slow-zoom" 
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
               <div className="animate-slide-up">
                 <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-xl">
                    {slide.title}
                 </h1>
                 <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
                    {slide.subtitle}
                 </p>
                 <Link href={slide.link} className="inline-flex items-center gap-2 bg-tacsfon-green text-white px-8 py-3 rounded-full font-bold text-base hover:bg-green-700 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,104,56,0.5)]">
                    {slide.cta} <ArrowRight size={18}/>
                 </Link>
               </div>
            </div>
          </div>
        ))}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white hidden md:block"><ChevronLeft size={32} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white hidden md:block"><ChevronRight size={32} /></button>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
           {slides.map((_, idx) => (
             <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-tacsfon-neonGreen w-8' : 'bg-white/50 hover:bg-white'}`} />
           ))}
        </div>
      </section>

      {/* --- QUICK ACCESS HUB --- */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/resources" className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:border-tacsfon-neonGreen hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-tacsfon-neonGreen group-hover:scale-110 transition-transform"><Folder size={28} /></div>
                    <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-tacsfon-neonGreen group-hover:text-black transition-colors">Faculty Access</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-tacsfon-green">Academic Hub</h3>
                <p className="text-gray-500 mb-6">Lecture notes, handouts, and past questions tailored for your department.</p>
                <div className="flex items-center text-gray-900 font-bold text-sm group-hover:text-tacsfon-neonGreen transition-colors">OPEN FOLDER <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/></div>
            </Link>
            <Link href="/media" className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:border-tacsfon-orange hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-tacsfon-orange group-hover:bg-tacsfon-orange group-hover:text-white transition-colors"><Video size={28} /></div>
                    <div className="bg-orange-100 text-orange-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sermons & Media</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-tacsfon-orange">Sermons & Media</h3>
                <p className="text-gray-500 mb-6">Stream audio messages, videos, and photo galleries from fellowship.</p>
                <div className="flex items-center text-tacsfon-orange font-bold text-sm">START STREAMING <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/></div>
            </Link>
        </div>
      </section>

      {/* --- BOOK COLLECTIONS SECTION --- */}
      <section id="collections" className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <span className="text-tacsfon-green font-bold uppercase tracking-widest text-xs mb-2 block">The Archives</span>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Book Collection</h2>
                <p className="text-gray-500">Curated spiritual literature for your growth.</p>
            </div>
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search titles, authors..." 
                  className="w-full pl-12 pr-6 py-4 rounded-xl bg-white border border-gray-200 focus:border-tacsfon-green outline-none shadow-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* CONTENT DISPLAY LOGIC */}
        {search ? (
           // STATE 1: SEARCH ACTIVE (Show Grid Results)
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {filteredBooks.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-gray-400">
                      <BookOpen size={48} className="mx-auto mb-4 opacity-20"/>
                      <p>No books found matching "{search}"</p>
                  </div>
              ) : filteredBooks.map((book) => (
                 <BookCard key={book.id} book={book} />
              ))}
           </div>
        ) : (
           // STATE 2: NO SEARCH (Show Categories using the SORTED list)
           <div className="space-y-12">
              {sortedCategoryNames.map((categoryName) => (
                 <div key={categoryName} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                       <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-2 h-8 bg-tacsfon-green rounded-full block"></span>
                          {categoryName}
                       </h3>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{categories[categoryName].length} Books</span>
                    </div>
                    
                    {/* HORIZONTAL SCROLL CONTAINER */}
                    <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide">
                       {categories[categoryName].map((book: any) => (
                          <div key={book.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                             <BookCard book={book} />
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        )}
      </section>

    </main>
  );
}

// --- HELPER COMPONENT FOR CONSISTENT CARDS ---
function BookCard({ book }: { book: any }) {
   return (
      <Link href={`/book/${book.id}`} className="group block h-full">
         <div className="relative aspect-[2/3] bg-gray-100 rounded-2xl overflow-hidden shadow-lg mb-4 border border-gray-100 group-hover:shadow-2xl group-hover:translate-y-[-5px] transition-all duration-300">
             <img 
               src={book.cover_url || `https://placehold.co/400x600?text=${book.title.substring(0,10)}`} 
               alt={book.title} 
               className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                 <span className="text-white text-xs font-bold uppercase tracking-wider">Read Now</span>
             </div>
         </div>
         <h3 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-tacsfon-green transition-colors line-clamp-2 text-sm md:text-base">{book.title}</h3>
         <p className="text-xs text-gray-500 font-medium line-clamp-1">{book.author}</p>
      </Link>
   );
}