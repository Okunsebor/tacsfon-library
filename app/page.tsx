'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { 
  Search, BookOpen, ArrowRight, Folder, Video, ChevronLeft, ChevronRight, 
  Users, Play, Flame, GraduationCap, Shield, Heart 
} from 'lucide-react';

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

  // --- 🧠 SUPER SMART SORTER ---
  const smartCategorize = (book: any) => {
    if (book.category && book.category !== 'General Collection' && book.category !== 'General') return book.category;
    
    const text = (book.title + " " + (book.summary || "")).toLowerCase();
    const author = (book.author || "").toLowerCase();

    // 1. AUTHOR INTELLIGENCE
    if (author.match(/hagin|oyedepo|adeboye|kumuyi|selman|watchman nee|spurgeon|copeland|prince|omartian|lewis|piper|lucado|kuhlman|hinn/i)) return 'Spiritual Growth';
    if (author.match(/maxwell|sinek|covey|carnegie|munroe/i)) {
       return (text.includes('prayer') || text.includes('spirit')) ? 'Spiritual Growth' : 'Leadership';
    }
    if (author.match(/kiyosaki|buffett|dangote|osuntokun|ramsey/i)) return 'Finance & Career';
    if (author.match(/chapman|vallotton/i)) return 'Relationships';

    // 2. KEYWORD INTELLIGENCE
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

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* --- 1. HERO SLIDESHOW SECTION --- */}
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
                 <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-xl font-heading">
                    {slide.title}
                 </h1>
                 <p className="text-sm md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
                    {slide.subtitle}
                 </p>
                 <Link href={slide.link} className="inline-flex items-center gap-2 bg-tacsfon-green text-white px-8 py-3 rounded-full font-bold text-base hover:bg-green-700 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,104,56,0.5)]">
                    {slide.cta} <ArrowRight size={18}/>
                 </Link>
               </div>
            </div>
          </div>
        ))}
        {/* Navigation Arrows */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white hidden md:block"><ChevronLeft size={32} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white hidden md:block"><ChevronRight size={32} /></button>
      </section>

      {/* --- 2. QUICK ACCESS HUB --- */}
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

      {/* --- 3. VIDEO SECTION --- */}
      <section className="relative w-full h-[500px] mt-24 overflow-hidden flex items-center justify-center">
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
              <span className="text-tacsfon-neonGreen font-bold tracking-[0.2em] text-sm uppercase mb-4 block animate-fade-in">About Us</span>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                  Welcome to the <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-tacsfon-green to-white">Family of Love.</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  We believe technology is more than just tools—it is the vehicle for spiritual and academic dominance. 
                  Join a community where creativity meets divinity.
              </p>
              
              <div className="flex justify-center">
                  <Link href="/about" className="px-10 py-4 bg-tacsfon-green text-white font-bold rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/50 hover:scale-105">
                     <Users size={20} /> Join Community
                  </Link>
              </div>
          </div>
      </section>

      {/* --- 4. NEW: TACSFON CORE PILLARS (Refined & Professional) --- */}
      <section className="py-24 bg-gradient-to-b from-[#0a1f13] to-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <span className="text-tacsfon-green font-bold tracking-[0.2em] uppercase text-sm">Our Core Values</span>
                  <h2 className="text-4xl md:text-5xl font-extrabold mt-2 text-white">Who We Are</h2>
                  <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                      "Let no man despise thy youth." We are more than a fellowship; we are a training ground for life—where spiritual fervor meets academic excellence.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Pillar 1 */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group">
                      <div className="w-12 h-12 bg-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Flame size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Spiritual Grounding</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                          Rooted in the Apostolic faith, we foster deep spiritual maturity through consistent prayer, sound doctrine, and the study of the Word.
                      </p>
                  </div>

                  {/* Pillar 2 */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group">
                      <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <GraduationCap size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Academic Excellence</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                          We believe spirituality and intellect go hand in hand. Our environment provides the resources and peer support needed to excel in your studies.
                      </p>
                  </div>

                  {/* Pillar 3 */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group">
                      <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Shield size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Service & Integrity</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                          We are committed to raising dependable leaders who serve with humility, integrity, and a genuine heart for the Kingdom.
                      </p>
                  </div>

                  {/* Pillar 4 */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group">
                      <div className="w-12 h-12 bg-purple-500/20 text-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Heart size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">Supportive Community</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                          A home away from home. We are a family that prioritizes the mental, emotional, and personal well-being of every member.
                      </p>
                  </div>
              </div>
              
              <div className="mt-12 text-center">
                   {/* ✅ REDIRECT TO ABOUT PAGE */}
                   <Link href="/about" className="inline-flex items-center gap-2 text-white border border-white/20 px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all font-bold">
                       Read Our Full History <ArrowRight size={18}/>
                   </Link>
              </div>
          </div>
      </section>

      {/* --- 5. BOOK COLLECTIONS SECTION --- */}
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