'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  LogOut, 
  Settings, 
  Calendar, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  MapPin,
  Zap,
  Brain,
  Flame,
  LayoutDashboard,
  PlayCircle
} from 'lucide-react';
import Image from 'next/image';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('Scholar');
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');
  
  // --- REAL DATA STATES ---
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [stats, setStats] = useState({
    booksRead: 0,
    hoursRead: 0,
    activeBorrows: 0,
    streak: 7,
  });

  // --- 1. DETERMINE TIME OF DAY ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // --- 2. SECURITY CHECK & DATA FETCH ---
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/student-login'); 
        return;
      }

      setUser(session.user);
      const email = session.user.email;

      // Get Name
      const fullName = session.user.user_metadata?.full_name;
      if (fullName) setUserName(fullName.split(' ')[0]);

      // --- A. FETCH READING HISTORY ---
      const { data: history } = await supabase
        .from('reading_history')
        .select(`
            last_read_at,
            book_id,
            books (id, title, author, cover_url)
        `)
        .eq('user_email', email)
        .order('last_read_at', { ascending: false });

      const historyData = history || [];
      setRecentBooks(historyData);

      // --- B. FETCH LOANS (Physical Books) ---
      const { data: loanData } = await supabase
        .from('loans')
        .select('*')
        .eq('student_email', email)
        .order('request_date', { ascending: false });
      
      const allLoans = loanData || [];
      setLoans(allLoans);

      // Filter active loans for stats
      const activeCount = allLoans.filter((l: any) => l.status === 'active').length;

      // --- C. CALCULATE STATS ---
      setStats(prev => ({
        ...prev,
        booksRead: historyData.length,
        hoursRead: historyData.length * 2, 
        activeBorrows: activeCount
      }));

      // --- D. FETCH RECOMMENDED ---
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .limit(4);
      
      setRecommendedBooks(books || []);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-tacsfon-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
        <p className="text-gray-500 font-bold text-sm animate-pulse tracking-wide uppercase">Preparing your dashboard</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      
      {/* --- HEADER SECTION --- */}
      <header className="bg-white/80 border-b border-gray-100 sticky top-0 z-40 backdrop-blur-xl">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
             <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-tacsfon-green to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-tacsfon-green/30 transition-shadow">
                  <LayoutDashboard size={20} className="text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-gray-900 hidden sm:inline">Student Portal</span>
             </Link>
             <div className="flex items-center gap-5">
                 <div className="hidden md:flex flex-col items-end mr-2">
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Student ID</span>
                     <span className="text-sm font-bold text-gray-800">{user?.email?.split('@')[0]}</span>
                 </div>
                 <div className="h-11 w-11 bg-gradient-to-br from-tacsfon-orange to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer ring-2 ring-white border border-gray-100">
                     {user?.email?.charAt(0).toUpperCase()}
                 </div>
             </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* --- STUNNING WELCOME BANNER --- */}
        <div className="relative bg-gradient-to-br from-tacsfon-green via-[#005a30] to-[#004222] rounded-[2rem] p-8 md:p-14 shadow-2xl shadow-tacsfon-green/20 text-white overflow-hidden">
            {/* Abstract Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tacsfon-orange/30 rounded-full mix-blend-screen filter blur-[80px] opacity-60 -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/20 rounded-full mix-blend-screen filter blur-[60px] opacity-40 translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 font-bold text-xs mb-6 tracking-wide uppercase shadow-sm">
                        <Calendar size={14} />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                        {greeting}, <br className="hidden md:block" />
                        <span className="text-tacsfon-orange">{userName}</span>
                    </h1>
                    <p className="text-emerald-50/80 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                        Ready to achieve your academic goals today? You are on a <span className="text-tacsfon-orange font-extrabold flex items-center inline-flex gap-1"><Flame size={20} className="text-tacsfon-orange"/> {stats.streak}-day streak</span>.
                    </p>
                </div>
                
                {/* Hero Actions */}
                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                    <Link href="/learning-hub" className="group relative px-8 py-4 bg-tacsfon-orange text-white font-bold rounded-2xl overflow-hidden shadow-lg shadow-tacsfon-orange/30 transition-transform hover:-translate-y-1 flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        <Brain size={20} /> Practice Now
                      </span>
                    </Link>
                    <Link href="/library" className="group px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                      <BookOpen size={20} /> Browse Library
                    </Link>
                </div>
            </div>
        </div>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT COLUMN: STATS & QUICK ACTIONS (8/12) --- */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* GLASSMORPHIC STATS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Books Read */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 text-tacsfon-green rounded-xl group-hover:scale-110 transition-transform">
                          <BookOpen size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Read</span>
                      </div>
                      <span className="text-4xl font-extrabold text-gray-900 block">{stats.booksRead}</span>
                      <p className="text-xs text-gray-500 mt-2 font-medium">Total completed</p>
                    </div>

                    {/* Hours Read */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-tacsfon-orange rounded-xl group-hover:scale-110 transition-transform">
                          <Clock size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Hours</span>
                      </div>
                      <span className="text-4xl font-extrabold text-gray-900 block">{stats.hoursRead}</span>
                      <p className="text-xs text-gray-500 mt-2 font-medium">Time invested</p>
                    </div>

                    {/* Active Borrows */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                          <MapPin size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Loans</span>
                      </div>
                      <span className="text-4xl font-extrabold text-gray-900 block">{stats.activeBorrows}</span>
                      <p className="text-xs text-gray-500 mt-2 font-medium">Physical books</p>
                    </div>

                    {/* Reading Streak */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-50 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                          <Flame size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Streak</span>
                      </div>
                      <span className="text-4xl font-extrabold text-gray-900 block">{stats.streak}</span>
                      <p className="text-xs text-gray-500 mt-2 font-medium">Days active</p>
                    </div>
                </div>

                {/* QUICK ACCESS CARDS */}
                <div>
                    <h3 className="font-extrabold text-gray-900 mb-6 text-xl flex items-center gap-2">
                        <Zap size={24} className="text-tacsfon-orange fill-tacsfon-orange/20"/> Explore Hubs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Link href="/learning-hub" className="group relative p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-tacsfon-green/10 transition-all overflow-hidden flex items-center justify-between">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex items-center gap-5">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 text-tacsfon-green rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Brain size={28} /></div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">Learning Hub</h4>
                                    <p className="text-sm text-gray-500 font-medium">CBT Practice & Mock Exams</p>
                                </div>
                            </div>
                            <div className="relative z-10 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-tacsfon-green group-hover:text-white transition-colors">
                              <ArrowRight size={20} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all"/>
                            </div>
                        </Link>

                        <Link href="/resources" className="group relative p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-tacsfon-orange/10 transition-all overflow-hidden flex items-center justify-between">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex items-center gap-5">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 text-tacsfon-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><BookOpen size={28} /></div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">Academic Hub</h4>
                                    <p className="text-sm text-gray-500 font-medium">Lecture Notes & Materials</p>
                                </div>
                            </div>
                            <div className="relative z-10 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-tacsfon-orange group-hover:text-white transition-colors">
                              <ArrowRight size={20} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all"/>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* PHYSICAL LIBRARY STATUS */}
                {(activeLoans.length > 0 || pendingLoans.length > 0) && (
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <h3 className="font-extrabold text-gray-900 mb-6 text-xl flex items-center gap-2">
                            <MapPin size={24} className="text-blue-500 fill-blue-500/20"/> My Physical Book Bag
                        </h3>
                        <div className="space-y-4">
                            {/* Pending Requests */}
                            {pendingLoans.map(loan => (
                                <div key={loan.id} className="p-5 bg-gradient-to-r from-orange-50 to-white rounded-2xl border border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1"><AlertCircle size={20} className="text-orange-500" /></div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-base">{loan.book_title}</p>
                                            <p className="text-sm text-orange-600 font-medium mt-1">Waiting for Librarian approval...</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-white text-orange-600 px-4 py-2 rounded-xl shadow-sm border border-orange-100 whitespace-nowrap text-center">Request Pending</span>
                                </div>
                            ))}

                            {/* Active Loans */}
                            {activeLoans.map(loan => (
                                <div key={loan.id} className="p-5 bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1"><CheckCircle size={20} className="text-emerald-500" /></div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-base group-hover:text-tacsfon-green transition-colors">{loan.book_title}</p>
                                            <p className="text-sm text-emerald-700 font-medium mt-1">Due Date: {new Date(loan.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-emerald-100 shadow-sm shrink-0">
                                        <Clock size={16} className="text-emerald-500"/>
                                        <div className="flex flex-col">
                                          <span className="text-lg font-extrabold text-gray-900 leading-none">
                                              {Math.max(0, Math.ceil((new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                                          </span>
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Days Left</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN: SIDEBAR (4/12) --- */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* RECENT ACTIVITY */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-extrabold text-gray-900 text-xl">Jump Back In</h3>
                    </div>
                    
                    {recentBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-sm">
                                <PlayCircle size={32} />
                            </div>
                            <p className="text-gray-900 font-bold mb-2">No active reading</p>
                            <p className="text-sm text-gray-500 max-w-[200px] mb-6">
                                Books you start reading will appear here.
                            </p>
                            <Link href="/library" className="px-6 py-3 bg-tacsfon-green text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-tacsfon-green/30">
                                Browse Books
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentBooks.slice(0, 4).map((entry: any) => (
                                <Link key={entry.book_id} href={`/book/${entry.book_id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group">
                                    <div className="h-20 w-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow relative">
                                        <Image 
                                          src={entry.books?.cover_url || "https://placehold.co/100x150?text=Book"} 
                                          alt="cover" 
                                          fill
                                          className="object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-tacsfon-green transition-colors mb-1">{entry.books?.title}</h4>
                                        <p className="text-xs text-gray-500 truncate font-medium">{entry.books?.author}</p>
                                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-tacsfon-orange bg-orange-50 w-fit px-2 py-1 rounded-md">
                                            <PlayCircle size={12} /> Continue
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            
                            <div className="pt-6 border-t border-gray-100">
                                <Link href="/library" className="w-full flex justify-center items-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-600 transition-colors">
                                    View Full Library <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* SETTINGS & LOGOUT */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-4">
                    <Link href="/dashboard/settings" className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <Settings size={20} />
                            </div>
                            <span className="font-bold text-gray-900">Profile Settings</span>
                        </div>
                        <ArrowRight size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-xl transition-colors group mt-2">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                                <LogOut size={20} />
                            </div>
                            <span className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">Sign Out</span>
                        </div>
                    </button>
                </div>
            </div>

        </div>
        
        {/* RECOMMENDED BOOKS BOTTOM ROW */}
        <div className="pt-8 border-t border-gray-200">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="font-extrabold text-gray-900 text-2xl mb-1">Recommended For You</h3>
                    <p className="text-gray-500 font-medium">Curated reads to expand your knowledge.</p>
                </div>
                <Link href="/library" className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-tacsfon-green hover:text-tacsfon-green transition-colors">
                    Explore All <ArrowRight size={16} />
                </Link>
            </div>
            
            {recommendedBooks.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-gray-100 text-center text-gray-500 font-medium">
                    Our library curation is currently updating. Check back soon!
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {recommendedBooks.map((book) => (
                        <Link key={book.id} href={`/book/${book.id}`} className="group block">
                            <div className="aspect-[2/3] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300">
                                <Image 
                                    src={book.cover_url || `https://placehold.co/400x600?text=${book.title.substring(0,5)}`} 
                                    alt={book.title} 
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <span className="bg-tacsfon-orange text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm">View Details</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-gray-900 text-base truncate group-hover:text-tacsfon-green transition-colors">{book.title}</h4>
                            <p className="text-sm text-gray-500 truncate font-medium mt-1">{book.author}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>

      </main>
    </div>
  );
}