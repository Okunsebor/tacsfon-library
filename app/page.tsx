'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { 
  Search, BookOpen, ArrowRight, Folder, Video, ChevronLeft, ChevronRight, 
  Users, Play, Flame, GraduationCap, Shield, Heart 
} from 'lucide-react';

// --- NEW COMPONENT: SPLASH SCREEN ---
function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Animated Logo */}
      <div className="relative mb-8 animate-pulse">
         <div className="flex items-center gap-2">
            <span className="h-8 w-8 bg-tacsfon-green rounded-tr-xl rounded-bl-xl"></span>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
              TACSFON<span className="text-tacsfon-green">LIB</span>
            </span>
         </div>
      </div>

      {/* Bouncing Dots */}
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-tacsfon-green rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-tacsfon-green rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-tacsfon-green rounded-full animate-bounce"></div>
      </div>
      
      <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
        Loading Resources...
      </p>
    </div>
  );
}

export default function Home() {
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    async function initData() {
      // Minimum loader time for branding
      const minLoaderTime = new Promise(resolve => setTimeout(resolve, 2000));
      const fetchData = supabase.from('books').select('*').order('title', { ascending: true });

      const [_, dataResult] = await Promise.all([minLoaderTime, fetchData]);

      if (dataResult.error) {
          console.error(dataResult.error);
      } else {
          setBooks(dataResult.data || []);
      }
      setIsLoading(false);
    }
    initData();
  }, []);

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  // --- 🧠 SUPER SMART SORTER ---
  const smartCategorize = (book: any) => {
    if (book.category && book.category !== 'General Collection' && book.category !== 'General') return book.category;
    const text = (book.title + " " + (book.summary || "")).toLowerCase();
    const author = (book.author || "").toLowerCase();

    if (author.match(/hagin|oyedepo|adeboye|kumuyi|selman|watchman nee|spurgeon|copeland|prince|omartian|lewis|piper|lucado|kuhlman|hinn/i)) return 'Spiritual Growth';
    if (author.match(/maxwell|sinek|covey|carnegie|munroe/i)) return (text.includes('prayer') || text.includes('spirit')) ? 'Spiritual Growth' : 'Leadership';
    if (author.match(/kiyosaki|buffett|dangote|osuntokun|ramsey/i)) return 'Finance & Career';
    if (author.match(/chapman|vallotton/i)) return 'Relationships';

    if (text.match(/leader|influence|laws|habit|strategy/i)) return 'Leadership';
    if (text.match(/prayer|god|spirit|jesus|faith|bible|gospel|church|devotional|holiness/i)) return 'Spiritual Growth';
    if (text.match(/money|finance|rich|wealth|business|economy|invest/i)) return 'Finance & Career';
    if (text.match(/physics|chem|math|calculus|program|code|python|engineer|biology|statistic|law/i)) return 'Academic';
    if (text.match(/love|marriage|dating|sex|courtship/i)) return 'Relationships';
    
    return 'General Collection';
  };

  const categories = books.reduce((acc, book) => {
    let catRaw = smartCategorize(book);
    const cat = catRaw.charAt(0).toUpperCase() + catRaw.slice(1).toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(book);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedCategoryNames = Object.keys(categories).sort();

  if (isLoading) return <Preloader />;

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* --- 1. HERO SLIDESHOW SECTION --- */}
      {/* ⚡ MOBILE FIX: Reduced height from 85vh to 65vh on mobile so users see content below */}
      <section className="relative h-[65vh] md:h-[85vh] w-full overflow-hidden bg-gray-900 text-white">
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
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 md:px-6 max-w-5xl mx-auto">
               <div className="animate-slide-up">
                 <h1 className="text-3xl md:text-5xl font-extrabold mb-3 md:mb-4 leading-tight tracking-tight drop-shadow-xl font-heading">
                    {slide.title}
                 </h1>
                 <p className="text-sm md:text-xl text-gray-200 max-w-2xl mx-auto mb-6 md:mb-8 font-light leading-relaxed">
                    {slide.subtitle}
                 </p>
                 <Link href={slide.link} className="inline-flex items-center gap-2 bg-tacsfon-green text-white px-6 py-3 md:px-8 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-green-700 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,104,56,0.5)]">
                    {slide.cta} <ArrowRight size={18}/>
                 </Link>
               </div>
            </div>
          </div>
        ))}
        {/* Navigation Arrows - Hidden on Mobile */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white hidden md:block"><ChevronLeft size={32} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white hidden md:block"><ChevronRight size={32} /></button>
      </section>

      {/* --- 2. QUICK ACCESS HUB --- */}
      {/* ⚡ MOBILE FIX: Reduced margin-top (-mt-10) and padding (p-5) for compact view */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 md:-mt-16 relative z-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Link href="/resources" className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 hover:border-tacsfon-neonGreen hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-tacsfon-neonGreen group-hover:scale-110 transition-transform"><Folder size={24} /></div>
                    <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider group-hover:bg-tacsfon-neonGreen group-hover:text-black transition-colors">Faculty Access</div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-tacsfon-green">Academic Hub</h3>
                <p className="text-sm md:text-base text-gray-500 mb-6">Lecture notes, handouts, and past questions tailored for your department.</p>
                <div className="flex items-center text-gray-900 font-bold text-xs md:text-sm group-hover:text-tacsfon-neonGreen transition-colors">OPEN FOLDER <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/></div>
            </Link>
            <Link href="/media" className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 hover:border-tacsfon-orange hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-tacsfon-orange group-hover:bg-tacsfon-orange group-hover:text-white transition-colors"><Video size={24} /></div>
                    <div className="bg-orange-100 text-orange-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sermons & Media</div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-tacsfon-orange">Sermons & Media</h3>
                <p className="text-sm md:text-base text-gray-500 mb-6">Stream audio messages, videos, and photo galleries from fellowship.</p>
                <div className="flex items-center text-tacsfon-orange font-bold text-xs md:text-sm">START STREAMING <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/></div>
            </Link>
        </div>
      </section>

      {/* --- 3. VIDEO SECTION --- */}
      {/* ⚡ MOBILE FIX: Height reduced to 400px on mobile */}
      <section className="relative w-full h-[400px] md:h-[500px] mt-16 md:mt-24 overflow-hidden flex items-center justify-center">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://mjtzovexgxjpjcehnizd.supabase.co/storage/v1/object/public/asssets/community.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-black/50"></div>

          <div className="relative z-10 text-center max-w-3xl px-6">
              <span className="text-tacsfon-neonGreen font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-3 block animate-fade-in">About Us</span>
              <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight">
                  Welcome to the <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-tacsfon-green to-white">Family of Love.</span>
              </h2>
              <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                  We believe technology is more than just tools—it is the vehicle for spiritual and academic dominance. 
              </p>
              
              <div className="flex justify-center">
                  <Link href="/about" className="px-8 py-3 md:px-10 md:py-4 bg-tacsfon-green text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/50 hover:scale-105 text-sm md:text-base">
                     <Users size={20} /> Join Community
                  </Link>
              </div>
          </div>
      </section>

      {/* --- 4. NEW: TACSFON CORE PILLARS --- */}
      {/* ⚡ MOBILE FIX: Horizontal Swipe Container (snap-x) on Mobile */}
      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-[20%] -left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-green-50/50 rounded-full blur-[100px] animate-pulse-slow"></div>
              <div className="absolute top-[40%] -right-[10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-emerald-50/50 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
              
              <div className="text-center mb-10 md:mb-20">
                  <span className="inline-block py-1 px-3 rounded-full bg-green-50 border border-green-100 text-tacsfon-green font-extrabold tracking-[0.15em] uppercase text-[10px] md:text-xs shadow-sm mb-4">
                      Our Core Values
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-tacsfon-green to-emerald-200">The Four Pillars</span>
                  </h2>
              </div>

              {/* ⚡ GRID TRANSFORMS INTO SCROLLABLE LIST ON MOBILE */}
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 md:grid md:grid-cols-4 md:gap-8 md:pb-0 scrollbar-hide">
                  
                  {/* Pillar 1 */}
                  <div className="min-w-[85vw] md:min-w-0 snap-center group relative p-6 md:p-8 rounded-3xl bg-white border border-gray-100 shadow-lg md:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,168,89,0.15)] hover:border-green-200 transition-all duration-500">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-tacsfon-green transition-colors duration-300">
                          <Flame size={24} className="text-tacsfon-green group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 group-hover:text-tacsfon-green">Spiritual Grounding</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          Rooted in the Apostolic faith, fostering deep maturity through consistent prayer and sound doctrine.
                      </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="min-w-[85vw] md:min-w-0 snap-center group relative p-6 md:p-8 rounded-3xl bg-white border border-gray-100 shadow-lg md:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,168,89,0.15)] hover:border-green-200 transition-all duration-500">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-tacsfon-green transition-colors duration-300">
                          <GraduationCap size={24} className="text-tacsfon-green group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 group-hover:text-tacsfon-green">Academic Dominion</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          Spirituality and intellect go hand in hand. We provide resources to excel and lead in your field.
                      </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="min-w-[85vw] md:min-w-0 snap-center group relative p-6 md:p-8 rounded-3xl bg-white border border-gray-100 shadow-lg md:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,168,89,0.15)] hover:border-green-200 transition-all duration-500">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-tacsfon-green transition-colors duration-300">
                          <Shield size={24} className="text-tacsfon-green group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 group-hover:text-tacsfon-green">Service & Integrity</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          Raising dependable leaders who serve with humility, integrity, and a genuine heart for the Kingdom.
                      </p>
                  </div>

                  {/* Pillar 4 */}
                  <div className="min-w-[85vw] md:min-w-0 snap-center group relative p-6 md:p-8 rounded-3xl bg-white border border-gray-100 shadow-lg md:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,168,89,0.15)] hover:border-green-200 transition-all duration-500">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-tacsfon-green transition-colors duration-300">
                          <Heart size={24} className="text-tacsfon-green group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 group-hover:text-tacsfon-green">The Family of Love</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          A home away from home. We prioritize the mental, emotional, and personal well-being of every member.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- 5. BOOK COLLECTIONS SECTION --- */}
      <section id="collections" className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 space-y-12 md:space-y-16">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="w-full md:w-auto">
                <span className="text-tacsfon-green font-bold uppercase tracking-widest text-xs mb-2 block">The Archives</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Book Collection</h2>
                <p className="text-gray-500 text-sm md:text-base">Curated spiritual literature for your growth.</p>
            </div>
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search titles, authors..." 
                  className="w-full pl-12 pr-6 py-3 md:py-4 rounded-xl bg-white border border-gray-200 focus:border-tacsfon-green outline-none shadow-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* CONTENT DISPLAY LOGIC */}
        {search ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
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
           <div className="space-y-12">
              {sortedCategoryNames.map((categoryName) => (
                 <div key={categoryName} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                       <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-2 h-6 md:h-8 bg-tacsfon-green rounded-full block"></span>
                          {categoryName}
                       </h3>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{categories[categoryName].length} Books</span>
                    </div>
                    
                    {/* Horizontal Scroll for Books */}
                    <div className="flex overflow-x-auto pb-8 gap-4 md:gap-6 snap-x snap-mandatory scrollbar-hide">
                       {categories[categoryName].map((book: any) => (
                          <div key={book.id} className="min-w-[140px] md:min-w-[200px] snap-start">
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

// --- HELPER COMPONENT ---
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