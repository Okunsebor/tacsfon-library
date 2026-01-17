'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Folder, Lock, ArrowRight, BookOpen, GraduationCap, Loader, Filter, X, Search } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';

export default function AcademicResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

  // --- FILTER STATES ---
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Dropdown Lists
  const faculties = ["All", "SAAT", "SEET", "SIPET", "SIT", "SET", "SLS", "SPS", "SICT", "SSTE"];
  const levels = ["All", "100 Level", "200 Level", "300 Level", "400 Level", "500 Level"];
  const types = ["All", "Lecture Note", "Past Question", "Textbook", "Handout"];

  useEffect(() => {
    async function init() {
      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 2. Get Student Details (Just for the "Hi, Name" header)
        const { data: profile } = await supabase
          .from('student_profiles') 
          .select('*')
          .eq('email', session.user.email)
          .single();
        setStudent(profile);
      }
      
      // 3. Fetch ALL Resources initially
      fetchResources(); 
    }
    init();
  }, []);

  // --- THE SEARCH & FILTER ENGINE ---
  async function fetchResources() {
    setLoading(true);
    
    let query = supabase.from('academic_resources').select('*').order('created_at', { ascending: false });

    // Apply Filters if they are not "All"
    if (selectedFaculty !== 'All') query = query.eq('faculty', selectedFaculty);
    if (selectedLevel !== 'All') query = query.eq('level', selectedLevel);
    if (selectedType !== 'All') query = query.eq('type', selectedType);
    
    // Apply Search (Case insensitive partial match)
    if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);

    const { data, error } = await query;
    
    if (error) console.error("Error fetching resources:", error);
    else setResources(data || []);
    
    setLoading(false);
  }

  // Trigger fetch whenever a filter changes
  useEffect(() => {
    fetchResources();
  }, [selectedFaculty, selectedLevel, selectedType, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
       <Navbar />

       <main className="pb-20 pt-8">
           
           {/* HEADER */}
           <div className="bg-gray-900 py-10 px-6 mx-4 rounded-3xl shadow-xl relative overflow-hidden mb-8 text-white">
              <div className="max-w-4xl mx-auto relative z-10">
                 <p className="text-tacsfon-neonGreen font-bold uppercase tracking-widest text-xs mb-2">Central Library</p>
                 <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                    {student ? `Hi, ${student.full_name.split(' ')[0]}` : 'Academic Hub'}
                 </h1>
                 <p className="text-gray-400 max-w-lg">
                    Browse materials from all faculties. Use the filters below to find exactly what you need.
                 </p>
              </div>
              <BookOpen size={120} className="text-gray-800 absolute -right-6 -bottom-6 opacity-50" />
           </div>

           {/* SEARCH & FILTER BAR */}
           <div className="max-w-4xl mx-auto px-4 mb-8">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                 
                 {/* Search Input */}
                 <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                    <input 
                       type="text" 
                       placeholder="Search by course title..." 
                       className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-tacsfon-green outline-none"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>

                 {/* Filter Toggle Button (Mobile) */}
                 <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden w-full flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl font-bold text-gray-700"
                 >
                    <Filter size={18} /> Filters
                 </button>

                 {/* Desktop Filters (Always visible on large screens) */}
                 <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-3 w-full md:w-auto`}>
                    
                    {/* Faculty Dropdown */}
                    <select 
                       className="p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-700 border-none cursor-pointer outline-none focus:ring-2 focus:ring-tacsfon-green"
                       value={selectedFaculty}
                       onChange={(e) => setSelectedFaculty(e.target.value)}
                    >
                       <option value="All">All Faculties</option>
                       {faculties.filter(f => f !== 'All').map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    {/* Level Dropdown */}
                    <select 
                       className="p-3 bg-gray-50 rounded-xl font-bold text-sm text-gray-700 border-none cursor-pointer outline-none focus:ring-2 focus:ring-tacsfon-green"
                       value={selectedLevel}
                       onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                       {levels.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
                    </select>

                 </div>
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
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
                    <button onClick={() => {setSelectedFaculty('All'); setSearchQuery(''); setSelectedLevel('All');}} className="mt-4 text-tacsfon-green font-bold text-sm hover:underline">Clear Filters</button>
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
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full tracking-wide">{res.faculty}</span>
                                <span className="text-xs text-gray-400 font-medium">{res.level || 'General'}</span>
                             </div>
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