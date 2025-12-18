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
  ArrowRight
} from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('Scholar'); // <--- NEW STATE
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [greeting, setGreeting] = useState('');

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

      // --- NEW: Extract Name from Metadata ---
      const fullName = session.user.user_metadata?.full_name;
      if (fullName) {
        // Get just the first name (e.g. "Praise" from "Praise Oyemen")
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);
      }

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-tacsfon-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold text-sm animate-pulse">Verifying Credentials...</p>
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
                    {/* --- UPDATED: Uses userName variable --- */}
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
                            <BookOpen size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Read</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">12</span>
                    </div>
                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-3 text-orange-600 mb-2">
                            <Clock size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Hours</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">45</span>
                    </div>
                    <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                        <div className="flex items-center gap-3 text-purple-600 mb-2">
                            <Award size={20} /> <span className="text-xs font-bold uppercase tracking-wider">Badges</span>
                        </div>
                        <span className="text-3xl font-extrabold text-gray-900">3</span>
                    </div>
                </div>

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

                {/* Recommended Section (DYNAMIC) */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Recommended For You</h3>
                        <Link href="/#collections" className="text-xs font-bold text-tacsfon-green hover:underline">View Library</Link>
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

            {/* --- RIGHT COLUMN: ACTIVITY --- */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
                    <h3 className="font-bold text-gray-900 mb-6">Recent Activity</h3>
                    
                    {/* Empty State Placeholder */}
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Clock size={32} />
                        </div>
                        <p className="text-gray-900 font-bold mb-1">No history yet</p>
                        <p className="text-xs text-gray-400 max-w-[200px]">
                            Books you read or download will appear here automatically.
                        </p>
                        <Link href="/#collections" className="mt-6 px-6 py-2 bg-tacsfon-green text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors">
                            Start Reading
                        </Link>
                    </div>

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