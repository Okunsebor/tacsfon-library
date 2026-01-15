'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Folder, Lock, ArrowRight, BookOpen, GraduationCap, Loader, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar'; // <--- Added Navbar back

export default function AcademicResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    async function init() {
      // 1. Get Real Supabase Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // No user logged in
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      
      // 2. FETCH STUDENT PROFILE using the Email from Supabase
      const { data: profile, error } = await supabase
        .from('student_profiles') 
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) {
        console.error("Profile Fetch Error:", error);
        setErrorMsg("Could not find your student profile. Please contact admin.");
        setLoading(false);
        return;
      }

      if (profile) {
        setStudent(profile);
        // 3. Fetch resources based on the faculty found in profile
        fetchResources(profile.faculty);
      } else {
        setErrorMsg("Student profile not found.");
        setLoading(false);
      }
    }

    init();
  }, []);

  async function fetchResources(userFaculty: string) {
    if (!userFaculty) {
        setLoading(false);
        return;
    }

    // 3. FETCH MATCHING FOLDERS
    const { data, error } = await supabase
      .from('academic_resources')
      .select('*')
      .eq('faculty', userFaculty);

    if (error) {
       console.error("Resource Error:", error);
    } else {
       setResources(data || []);
    }
    setLoading(false);
  }

  // --- ACCESS DENIED (Not Logged In) ---
  if (!loading && !student) {
    return (
      <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 max-w-md w-full">
            <Lock size={48} className="text-tacsfon-orange mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
            <p className="text-gray-400 text-sm mb-4">
               {errorMsg || "You must be logged in to access the Academic Hub."}
            </p>
            <Link href="/student-login" className="block w-full bg-tacsfon-orange text-white font-bold py-3 rounded-xl mt-4 hover:bg-orange-600 transition-colors">
                Log In
            </Link>
            <Link href="/" className="block mt-4 text-gray-500 text-sm hover:text-white">Return Home</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
       <Navbar /> {/* <--- Added Navbar for better navigation */}

       <main className="pb-20 pt-8">
           
           {/* HEADER */}
           <div className="bg-gray-900 py-8 px-4 md:py-12 md:px-6 mx-4 rounded-3xl shadow-xl relative overflow-hidden mb-8">
              <div className="max-w-4xl mx-auto flex items-center justify-between text-white relative z-10">
                 <div>
                    <p className="text-tacsfon-neonGreen font-bold uppercase tracking-widest text-xs mb-2">Academic Hub</p>
                    <h1 className="text-2xl md:text-5xl font-extrabold mb-2 leading-tight break-words">Hi, {student?.full_name?.split(' ')[0]}</h1>
                    <div className="inline-flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-xs font-bold border border-gray-700 mt-2">
                       <GraduationCap size={14} className="text-tacsfon-orange"/> {student?.faculty || 'No Faculty Set'}
                    </div>
                 </div>
                 <BookOpen size={80} className="text-gray-800 hidden md:block" />
              </div>
           </div>

           {/* RESOURCES GRID */}
           <div className="max-w-4xl mx-auto px-6">
              {loading ? (
                 <div className="flex justify-center py-20"><Loader className="animate-spin text-tacsfon-green" /></div>
              ) : resources.length === 0 ? (
                 <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-gray-100">
                    <Folder size={32} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-gray-800 font-bold text-lg">No Materials Found</h3>
                    <p className="text-gray-400 text-sm mt-1">We couldn't find folders tagged specifically for <strong>"{student?.faculty}"</strong>.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((res) => (
                       <a key={res.id} href={res.link} target="_blank" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-tacsfon-green hover:-translate-y-1 transition-all group flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <Folder size={24} />
                          </div>
                          <div className="flex-grow">
                             <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{res.title}</h3>
                             <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wider">{res.department}</p>
                          </div>
                          <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-600 self-center" />
                       </a>
                    ))}
                 </div>
              )}
           </div>
       </main>
    </div>
  );
}