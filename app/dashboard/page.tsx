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
  Award, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,   // New
  AlertCircle,   // New
  MapPin         // New
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('Scholar');
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');
  
  // --- REAL DATA STATES ---
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]); // ✅ Added: State for physical loans
  const [stats, setStats] = useState({
    booksRead: 0,
    hoursRead: 0,
    activeBorrows: 0
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

      // --- B. FETCH LOANS (Physical Books) --- ✅ NEW
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
      setStats({
        booksRead: historyData.length,
        hoursRead: historyData.length * 2, 
        activeBorrows: activeCount // ✅ Updated to use real loan count
      });

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

  // ✅ Helper variables for UI
  const pendingLoans = loans.filter(l => l.status === 'requested');
  const activeLoans = loans.filter(l => l.status === 'active');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-tacsfon-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold text-sm animate-pulse">Loading Your Profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* --- HEADER SECTION --- */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
             <Link href="/" className="flex items-center gap-2">
                <img src="/tacsfon-brand.png" alt="Logo" className="h-8 w-auto" />
             </Link>
             <div className="flex items-center gap-4">
                 <div className="hidden md:flex flex-col items-end mr-2">
                     <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Student ID</span>
                     <span className="text-sm font-bold text-gray-900">{user?.email?.split('@')[0]}</span>
                 </div>
                 <div className="h-10 w-10 bg-tacsfon-green text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-green-100">
                     {user?.email?.charAt(0).toUpperCase()}
                 </div>
             </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* --- WELCOME CARD --- */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-tacsfon-green font-bold text-sm mb-2">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                        {greeting}, <span className="text-gray-400">{userName}.</span>
                    </h1>
                    <p className="text-gray-500 max-w-lg">
                        Ready to expand your horizon? Your digital library is ready.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
                        <Settings size={18} /> Settings
                    </Link>
                    
                    <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN: STATS & ACTIONS --- */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-3 text-blue-600 mb-2">
                            <BookOpen size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Books Read</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">{stats.booksRead}</span>
                    </div>
                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-orange-600 mb-2">
                            <Clock size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Est. Hours</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">{stats.hoursRead}</span>
                    </div>
                    <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-3 text-purple-600 mb-2">
                            <Award size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Active Borrows</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">{stats.activeBorrows}</span>
                    </div>
                </div>

                {/* ✅ NEW: PHYSICAL LIBRARY STATUS (Loans & Requests) */}
                {(activeLoans.length > 0 || pendingLoans.length > 0) && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-tacsfon-green"/> My Book Bag
                        </h3>
                        <div className="space-y-3">
                            {/* Pending Requests */}
                            {pendingLoans.map(loan => (
                                <div key={loan.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{loan.book_title}</p>
                                        <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12}/> Waiting for Librarian approval...
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold bg-white text-orange-600 px-3 py-1 rounded-full shadow-sm">Pending</span>
                                </div>
                            ))}

                            {/* Active Loans */}
                            {activeLoans.map(loan => (
                                <div key={loan.id} className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{loan.book_title}</p>
                                        <p className="text-xs text-green-700 flex items-center gap-1 mt-1">
                                            <CheckCircle size={12}/> Due: {new Date(loan.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-800 leading-none">
                                            {Math.max(0, Math.ceil((new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Days Left</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-tacsfon-green"/> Quick Access
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/resources" className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><BookOpen size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Academic Hub</h4>
                                    <p className="text-xs text-gray-500">Lecture notes & handouts</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"/>
                        </Link>

                        <Link href="/media" className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:scale-110 transition-transform"><VideoIcon size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Sermons</h4>
                                    <p className="text-xs text-gray-500">Audio & Video messages</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all"/>
                        </Link>
                    </div>
                </div>

                {/* Recommended Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Recommended For You</h3>
                        <Link href="/library" className="text-xs font-bold text-tacsfon-green hover:underline">View Library</Link>
                    </div>
                    
                    {recommendedBooks.length === 0 ? (
                        <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-400 text-sm">
                            Library is currently updating...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {recommendedBooks.map((book) => (
                                <Link key={book.id} href={`/book/${book.id}`} className="block group">
                                    <div className="aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden mb-3 relative shadow-sm group-hover:shadow-lg transition-all">
                                        <img 
                                            src={book.cover_url || `https://placehold.co/400x600?text=${book.title.substring(0,5)}`} 
                                            alt={book.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{book.title}</h4>
                                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* --- RIGHT COLUMN: RECENT ACTIVITY --- */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
                    <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
                    
                    {recentBooks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <Clock size={32} />
                            </div>
                            <p className="text-gray-900 font-bold mb-1">No history yet</p>
                            <p className="text-xs text-gray-400 max-w-[200px]">
                                Books you read or download will appear here automatically.
                            </p>
                            <Link href="/library" className="mt-6 px-6 py-2 bg-tacsfon-green text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors">
                                Start Reading
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentBooks.slice(0, 4).map((entry: any) => (
                                <Link key={entry.book_id} href={`/book/${entry.book_id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                                    <div className="h-16 w-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        <img 
                                          src={entry.books?.cover_url || "https://placehold.co/100x150"} 
                                          alt="cover" 
                                          className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-tacsfon-green transition-colors">{entry.books?.title}</h4>
                                        <p className="text-xs text-gray-500">{entry.books?.author}</p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">Continued reading...</span>
                                    </div>
                                </Link>
                            ))}
                            
                            <div className="pt-4 border-t border-gray-100 text-center">
                                <Link href="/library" className="text-xs font-bold text-tacsfon-green hover:underline">View Full Library</Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>

        </div>
      </main>
    </div>
  );
}

// Icon Helper
function VideoIcon({size}: {size: number}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
    )
}