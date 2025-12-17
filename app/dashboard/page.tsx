'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { User, BookOpen, Clock, LogOut, Settings, Award } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Mock data for now (we can connect this to real backend later)
  const stats = [
    { label: "Books Read", value: "12", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Study Hours", value: "45", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Achievements", value: "3", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/student-login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    }
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/student-login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-tacsfon-green"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, Scholar.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PROFILE CARD */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-24 h-24 bg-tacsfon-green text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-green-200">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900 truncate">{user?.email}</h2>
              <p className="text-sm text-gray-400 font-medium mb-6">Student Member</p>
              
              <div className="flex justify-center gap-2">
                 <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                    <Settings size={14} /> Edit Profile
                 </button>
              </div>
            </div>

            {/* Quick Stats (Mobile/Desktop) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Your Activity</h3>
               <div className="space-y-4">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                             <stat.icon size={18} />
                          </div>
                          <span className="font-medium text-gray-600">{stat.label}</span>
                       </div>
                       <span className="font-bold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               <Link href="/resources" className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 hover:-translate-y-1 transition-transform relative overflow-hidden group">
                  <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform">
                     <BookOpen size={100} />
                  </div>
                  <h3 className="font-bold text-lg relative z-10">Academic Hub</h3>
                  <p className="text-blue-100 text-xs mt-1 relative z-10">Access your notes</p>
               </Link>
               
               <Link href="/media" className="bg-orange-500 text-white p-6 rounded-2xl shadow-lg shadow-orange-200 hover:-translate-y-1 transition-transform relative overflow-hidden group">
                  <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform">
                     <Clock size={100} />
                  </div>
                  <h3 className="font-bold text-lg relative z-10">Sermons</h3>
                  <p className="text-orange-100 text-xs mt-1 relative z-10">Listen & grow</p>
               </Link>

               <Link href="/#collections" className="bg-tacsfon-green text-white p-6 rounded-2xl shadow-lg shadow-green-200 hover:-translate-y-1 transition-transform relative overflow-hidden group sm:col-span-1 col-span-2">
                  <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform">
                     <Award size={100} />
                  </div>
                  <h3 className="font-bold text-lg relative z-10">Library</h3>
                  <p className="text-green-100 text-xs mt-1 relative z-10">Borrow books</p>
               </Link>
            </div>

            {/* Recent Section Placeholder */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center py-16">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <BookOpen size={32} />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No Recent Activity</h3>
               <p className="text-gray-400 max-w-sm mx-auto mb-6">You haven't opened any books recently. Start exploring the library to build your history.</p>
               <Link href="/#collections" className="text-tacsfon-green font-bold hover:underline">
                  Browse Collection
               </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}