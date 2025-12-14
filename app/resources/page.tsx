'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Folder, Lock, ArrowRight, BookOpen, GraduationCap, Loader, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AcademicResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  useEffect(() => {
    async function init() {
      // 1. Get Email from Session
      const savedSession = localStorage.getItem('tacsfonStudent');
      
      if (!savedSession) {
        setDebugInfo('No session found in LocalStorage.');
        setLoading(false);
        return;
      }

      const sessionData = JSON.parse(savedSession);
      
      // 2. FETCH STUDENT PROFILE (FROM THE CORRECT TABLE: student_profiles)
      const { data: profile, error } = await supabase
        .from('student_profiles') // <--- THIS WAS THE PROBLEM. NOW FIXED.
        .select('*')
        .eq('email', sessionData.email) // Assuming 'email' is a column in student_profiles. If not, we might need to match via user_id
        .single();

      if (error) {
        // If email isn't in student_profiles, try matching by full_name if necessary, but email is safer
        setDebugInfo(`Error fetching student: ${error.message}`);
        console.error(error);
        setLoading(false);
        return;
      }

      if (profile) {
        setStudent(profile);
        setDebugInfo(`Found Student: ${profile.full_name}. Faculty: "${profile.faculty}". Fetching resources...`);
        fetchResources(profile.faculty);
      } else {
        setDebugInfo("Student profile not found in database.");
        setLoading(false);
      }
    }

    init();
  }, []);

  async function fetchResources(userFaculty: string) {
    if (!userFaculty) {
        setDebugInfo(prev => prev + " STOPPED: User has no faculty assigned.");
        setLoading(false);
        return;
    }

    // 3. FETCH MATCHING FOLDERS
    const { data, error } = await supabase
      .from('academic_resources')
      .select('*')
      .eq('faculty', userFaculty);

    if (error) {
        setDebugInfo(prev => prev + ` | Resource Error: ${error.message}`);
    } else {
        setResources(data || []);
        setDebugInfo(prev => prev + ` | Success! Found ${data?.length} folders.`);
    }
    setLoading(false);
  }

  // --- ACCESS DENIED ---
  if (!loading && !student) {
    return (
      <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 max-w-md w-full">
            <Lock size={48} className="text-tacsfon-orange mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
            <p className="text-gray-400 text-sm mb-4">{debugInfo}</p>
            <Link href="/student-login" className="block w-full bg-tacsfon-orange text-white font-bold py-3 rounded-xl mt-4">Log In</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
       
       {/* HEADER */}
       <div className="bg-gray-900 py-12 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-white relative z-10">
             <div>
                <p className="text-tacsfon-neonGreen font-bold uppercase tracking-widest text-xs mb-2">Academic Hub</p>
                <h1 className="text-3xl md:text-4xl font-extrabold mb-1">Hi, {student?.full_name?.split(' ')[0]}</h1>
                <div className="inline-flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-xs font-bold border border-gray-700 mt-2">
                   <GraduationCap size={14} className="text-tacsfon-orange"/> {student?.faculty || 'No Faculty Set'}
                </div>
             </div>
             <BookOpen size={80} className="text-gray-800 hidden md:block" />
          </div>
       </div>

       {/* RESOURCES GRID */}
       <div className="max-w-4xl mx-auto p-6 -mt-8 relative z-20">
          {loading ? (
             <div className="flex justify-center py-20"><Loader className="animate-spin text-tacsfon-green" /></div>
          ) : resources.length === 0 ? (
             <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-gray-100">
                <Folder size={32} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-gray-800 font-bold text-lg">No Materials Found</h3>
                <p className="text-gray-400 text-sm mt-1">We couldn't find folders tagged specifically for <strong>"{student?.faculty}"</strong>.</p>
                <p className="text-xs text-red-400 mt-4 border-t pt-2">Debug: {debugInfo}</p>
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
  );
}