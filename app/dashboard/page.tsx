'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen, Clock, LogOut, Settings, ArrowRight, CheckCircle,
  AlertCircle, MapPin, Zap, Brain, Flame, Home, Star,
  Heart, Search, Bell, ChevronRight, PlayCircle, TrendingUp
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('Scholar');
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [newBooks, setNewBooks] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [featuredBook, setFeaturedBook] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Recommended');
  const [stats, setStats] = useState({ booksRead: 0, hoursRead: 0, activeBorrows: 0, streak: 7 });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/student-login'); return; }
      setUser(session.user);
      const email = session.user.email;
      const fullName = session.user.user_metadata?.full_name;
      if (fullName) setUserName(fullName.split(' ')[0]);

      const { data: history } = await supabase
        .from('reading_history')
        .select('last_read_at, book_id, books (id, title, author, cover_url)')
        .eq('user_email', email)
        .order('last_read_at', { ascending: false });
      const historyData = history || [];
      setRecentBooks(historyData);

      const { data: loanData } = await supabase
        .from('loans').select('*').eq('student_email', email)
        .order('request_date', { ascending: false });
      const allLoans = loanData || [];
      setLoans(allLoans);
      const activeCount = allLoans.filter((l: any) => l.status === 'active').length;
      setStats(prev => ({ ...prev, booksRead: historyData.length, hoursRead: historyData.length * 2, activeBorrows: activeCount }));

      const { data: books } = await supabase.from('books').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(8);
      const allBooks = books || [];
      setRecommendedBooks(allBooks.slice(0, 4));
      setNewBooks(allBooks.slice(4, 8));
      if (allBooks.length > 0) setFeaturedBook(allBooks[0]);
      setLoading(false);
    }
    init();
  }, [router]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace('/student-login');
  };

  const pendingLoans = loans.filter(l => l.status === 'requested');
  const activeLoans = loans.filter(l => l.status === 'active');

  const tabs = ['Recommended', 'New Arrivals', 'Academic', 'Spiritual'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F4F8' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#006838', borderTopColor: 'transparent' }}></div>
        <p className="text-gray-500 font-bold text-sm animate-pulse tracking-wide uppercase">Preparing your dashboard</p>
      </div>
    </div>
  );

  const displayBooks = activeTab === 'Recommended' ? recommendedBooks : newBooks;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: '#F0F4F8' }}>

      {/* ===== LEFT SIDEBAR ===== */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 sticky top-0 h-screen py-8 px-4 z-30">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-2 mb-10">
          <img src="/tacsfon-brand.png" alt="TACSFON" className="h-10 w-auto object-contain" />
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1">
          <SidebarLink href="/dashboard" icon={<Home size={20} />} label="Home" active />
          <SidebarLink href="/" icon={<BookOpen size={20} />} label="Discover" />
          <SidebarLink href="/resources" icon={<Zap size={20} />} label="Academic Hub" />
          <SidebarLink href="/learning-hub" icon={<Brain size={20} />} label="Learning Hub" />
          <SidebarLink href="/dashboard/settings" icon={<Heart size={20} />} label="Wishlist" />
          <SidebarLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* Update Banner */}
        <div className="mt-auto rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #e8f5ee, #fff3e0)' }}>
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
            <span className="text-4xl">🚀</span>
          </div>
          <p className="text-xs font-bold text-gray-700 mb-1">New update available!</p>
          <p className="text-[10px] text-gray-500 mb-3">Click to update</p>
          <button className="w-full py-2 rounded-xl text-white text-xs font-bold transition-all hover:-translate-y-0.5" style={{ background: '#006838' }}>
            Update
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Top Search Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-4 flex items-center gap-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search your favorite books"
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-2xl text-sm border border-gray-100 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#006838' } as any}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell size={20} className="text-gray-500" />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg cursor-pointer" style={{ background: 'linear-gradient(135deg, #F7941D, #e07b10)' }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-10">

          {/* ===== HERO WELCOME BANNER ===== */}
          <section className="mx-6 mt-6 rounded-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #006838 0%, #004d28 60%, #003a1e 100%)', minHeight: '200px' }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 -translate-y-1/3 translate-x-1/4" style={{ background: '#F7941D', filter: 'blur(60px)' }} />
            <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full opacity-10" style={{ background: '#00FF88', filter: 'blur(40px)' }} />
            {/* Floating dots */}
            {[{t:'15%',l:'55%',c:'#F7941D'},{t:'60%',l:'45%',c:'#fff'},{t:'20%',l:'80%',c:'#00FF88'},{t:'70%',l:'70%',c:'#F7941D'}].map((d,i) => (
              <div key={i} className="absolute w-2.5 h-2.5 rounded-full opacity-60" style={{ top: d.t, left: d.l, background: d.c }} />
            ))}
            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold mb-2 uppercase tracking-widest" style={{ color: '#00FF88' }}>Central Library</p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
                  {greeting},<br />
                  <span style={{ color: '#F7941D' }}>{userName}!</span>
                </h1>
                <p className="text-white/70 mb-5 text-sm md:text-base">Selection of the best books,<br />just for you</p>
                <Link href="/" className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:-translate-y-1 shadow-lg"
                  style={{ background: '#F7941D', boxShadow: '0 8px 20px rgba(247,148,29,0.4)' }}>
                  Show latest <ArrowRight size={16} />
                </Link>
              </div>
              {/* Illustrative reading figure */}
              <div className="hidden md:flex items-center justify-center w-48 h-36 opacity-90">
                <span className="text-[100px]">📚</span>
              </div>
            </div>
          </section>

          {/* ===== STATS ROW ===== */}
          <section className="mx-6 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<BookOpen size={20} />} value={stats.booksRead} label="Books Read" color="#006838" bg="#e8f5ee" />
            <StatCard icon={<Clock size={20} />} value={stats.hoursRead} label="Hours" color="#F7941D" bg="#fff3e0" />
            <StatCard icon={<MapPin size={20} />} value={stats.activeBorrows} label="Active Loans" color="#3b82f6" bg="#eff6ff" />
            <StatCard icon={<Flame size={20} />} value={stats.streak} label="Day Streak" color="#ef4444" bg="#fef2f2" />
          </section>

          {/* ===== RECOMMENDED / TABS SECTION ===== */}
          <section className="mx-6 mt-8">
            {/* Tab Headers */}
            <div className="flex items-center gap-6 mb-6 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-bold pb-1 border-b-2 transition-all ${activeTab === tab ? 'border-current' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                  style={activeTab === tab ? { color: '#006838', borderColor: '#006838' } : {}}
                >
                  {tab}
                </button>
              ))}
              <Link href="/" className="ml-auto text-xs font-bold flex items-center gap-1" style={{ color: '#F7941D' }}>
                Explore All <ChevronRight size={14} />
              </Link>
            </div>

            {/* Book Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {displayBooks.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="aspect-[2/3] bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded" />
                      <div className="h-2 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : displayBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>

          {/* ===== QUICK ACCESS HUBS ===== */}
          <section className="mx-6 mt-8">
            <h2 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Zap size={20} style={{ color: '#F7941D' }} /> Explore Hubs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/learning-hub" className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#e8f5ee', color: '#006838' }}>
                    <Brain size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Learning Hub</h4>
                    <p className="text-xs text-gray-500">CBT Practice & Mock Exams</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/resources" className="group flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#fff3e0', color: '#F7941D' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Academic Hub</h4>
                    <p className="text-xs text-gray-500">Lecture Notes & Materials</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>

          {/* ===== JUMP BACK IN (Recent Reading) ===== */}
          {recentBooks.length > 0 && (
            <section className="mx-6 mt-8">
              <h2 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <PlayCircle size={20} style={{ color: '#006838' }} /> Jump Back In
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {recentBooks.slice(0, 6).map((entry: any) => (
                  <Link key={entry.book_id} href={`/book/${entry.book_id}`} className="flex-shrink-0 w-36 group">
                    <div className="relative aspect-[2/3] bg-gray-100 rounded-2xl overflow-hidden mb-2 shadow-sm group-hover:shadow-lg transition-all group-hover:-translate-y-1">
                      <Image src={entry.books?.cover_url || 'https://placehold.co/200x300?text=Book'} alt="cover" fill className="object-cover" />
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-tacsfon-green">{entry.books?.title}</h4>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ===== LOANS SECTION ===== */}
          {(activeLoans.length > 0 || pendingLoans.length > 0) && (
            <section className="mx-6 mt-8">
              <h2 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" /> My Book Bag
              </h2>
              <div className="space-y-3">
                {pendingLoans.map(loan => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-orange-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={18} className="text-orange-500 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{loan.book_title}</p>
                        <p className="text-xs text-orange-500">Awaiting Librarian approval</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-1 rounded-full">Pending</span>
                  </div>
                ))}
                {activeLoans.map(loan => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-green-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-500 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{loan.book_title}</p>
                        <p className="text-xs text-green-600">Due: {new Date(loan.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-extrabold text-gray-900 block">{Math.max(0, Math.ceil((new Date(loan.due_date).getTime() - Date.now()) / 86400000))}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Days Left</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ===== SETTINGS & LOGOUT ===== */}
          <section className="mx-6 mt-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
              <Link href="/dashboard/settings" className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors"><Settings size={18} className="text-gray-500 group-hover:text-blue-600" /></div>
                  <span className="font-bold text-gray-900 text-sm">Profile Settings</span>
                </div>
                <ArrowRight size={16} className="text-gray-300" />
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-rose-100 transition-colors"><LogOut size={18} className="text-gray-500 group-hover:text-rose-600" /></div>
                  <span className="font-bold text-gray-900 text-sm group-hover:text-rose-600">Sign Out</span>
                </div>
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* ===== RIGHT PANEL: FEATURED BOOK ===== */}
      {featuredBook && (
        <aside className="hidden xl:flex flex-col w-72 sticky top-0 h-screen overflow-y-auto py-8 px-5 z-20" style={{ background: '#1a2332' }}>
          <div className="text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#00FF88' }}>Featured</p>
            <h3 className="text-white font-extrabold text-base leading-tight">{featuredBook.title}</h3>
          </div>
          {/* Book Cover */}
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mx-4 shadow-2xl mb-6">
            <Image src={featuredBook.cover_url || 'https://placehold.co/300x450?text=Book'} alt={featuredBook.title} fill className="object-cover" unoptimized={!featuredBook.cover_url} />
          </div>
          {/* Author & Rating */}
          <div className="text-center mb-4">
            <p className="text-white/70 text-sm font-medium">{featuredBook.author}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-yellow-400/30 text-yellow-400/30'} />
              ))}
              <span className="text-white/60 text-xs ml-1">4.8</span>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[['200', 'pages'], ['4.8', 'rating'], ['150+', 'reviews']].map(([v, l]) => (
              <div key={l} className="text-center p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <span className="text-white font-extrabold text-sm block">{v}</span>
                <span className="text-white/50 text-[10px] capitalize">{l}</span>
              </div>
            ))}
          </div>
          {/* Description */}
          {featuredBook.summary && (
            <p className="text-white/50 text-xs leading-relaxed mb-6 line-clamp-4">{featuredBook.summary}</p>
          )}
          {/* Read Button */}
          <Link href={`/book/${featuredBook.id}`} className="w-full py-3.5 rounded-2xl text-white font-bold text-sm text-center transition-all hover:-translate-y-1 shadow-lg block"
            style={{ background: '#F7941D', boxShadow: '0 8px 20px rgba(247,148,29,0.4)' }}>
            Read Now
          </Link>

          {/* Trending Section */}
          <div className="mt-8">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#00FF88' }}>
              <TrendingUp size={12} /> Trending
            </h4>
            <div className="space-y-3">
              {recommendedBooks.slice(1, 4).map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} className="flex items-center gap-3 group">
                  <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                    <Image src={book.cover_url || 'https://placehold.co/80x112?text=Book'} alt={book.title} fill className="object-cover" unoptimized={!book.cover_url} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white text-xs font-bold line-clamp-2 group-hover:text-yellow-400 transition-colors">{book.title}</h5>
                    <p className="text-white/40 text-[10px] truncate">{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

// --- Helper Components ---
function SidebarLink({ href, icon, label, active = false }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${active ? 'text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
      style={active ? { background: '#006838' } : {}}>
      <span className={active ? 'text-white' : 'text-gray-400'}>{icon}</span>
      {label}
    </Link>
  );
}

function StatCard({ icon, value, label, color, bg }: { icon: any; value: number; label: string; color: string; bg: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ background: bg, color }}>{icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <span className="text-3xl font-extrabold text-gray-900 block">{value}</span>
    </div>
  );
}

function BookCard({ book }: { book: any }) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="relative aspect-[2/3] bg-gray-100 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1.5 transition-all duration-300">
        <Image src={book.cover_url || `https://placehold.co/300x450?text=${encodeURIComponent(book.title?.substring(0,8) || 'Book')}`}
          alt={book.title} fill className="object-cover" unoptimized={!book.cover_url} sizes="(max-width: 768px) 150px, 200px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#F7941D' }}>Read</span>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-0.5 group-hover:text-tacsfon-green transition-colors">{book.title}</h3>
      <p className="text-xs text-gray-400 truncate">{book.author}</p>
      <div className="flex items-center gap-1 mt-1">
        <Star size={10} className="fill-yellow-400 text-yellow-400" />
        <span className="text-[10px] text-gray-400 font-medium">4.5</span>
      </div>
    </Link>
  );
}