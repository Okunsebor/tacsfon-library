'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminGatekeeper from '@/app/components/AdminGatekeeper';
import { FolderPlus, Trash2, Link as LinkIcon, Save, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminAcademicHub() {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [faculty, setFaculty] = useState('SAAT'); // Default to first acronym
  const [level, setLevel] = useState('100 Level');
  const [type, setType] = useState('Lecture Note');
  const [searchQuery, setSearchQuery] = useState('');

  // MATCHING LISTS (The exact same as the Student View)
  const faculties = ["SAAT", "SEET", "SIPET", "SIT", "SET", "SLS", "SPS", "SICT", "SSTE"];
  const levels = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"];

  useEffect(() => {
    fetchResources();
  }, [searchQuery]);

  async function fetchResources() {
    let query = supabase.from('academic_resources').select('*').order('created_at', { ascending: false });
    if(searchQuery) query = query.ilike('title', `%${searchQuery}%`);
    
    const { data } = await query;
    setResources(data || []);
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faculty || !title || !link) return alert("Please fill in all fields");
    
    setLoading(true);
    const { error } = await supabase.from('academic_resources').insert({
        title,
        link,
        faculty,
        level,
        type
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Resource Added Successfully!");
        setTitle('');
        setLink('');
        fetchResources(); // Refresh list
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this file?")) return;
    await supabase.from('academic_resources').delete().eq('id', id);
    fetchResources();
  };

  return (
    <AdminGatekeeper>
      <div className="min-h-screen bg-gray-50 p-8 pt-24">
        <div className="max-w-5xl mx-auto">
            
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm"><ArrowLeft size={20}/></Link>
                <h1 className="text-3xl font-bold text-gray-900">Academic Hub Manager</h1>
            </div>

            {/* UPLOAD FORM */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
                <h2 className="font-bold text-xl mb-6 flex items-center gap-2 text-tacsfon-green">
                    <FolderPlus /> Add New Resource
                </h2>
                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Title */}
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resource Title</label>
                        <input type="text" required placeholder="e.g. MTH 101 - Algebra Notes" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green" value={title} onChange={e => setTitle(e.target.value)}/>
                    </div>

                    {/* Link */}
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Google Drive / PDF Link</label>
                        <div className="relative">
                            <LinkIcon size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                            <input type="url" required placeholder="https://drive.google.com/..." className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green" value={link} onChange={e => setLink(e.target.value)}/>
                        </div>
                    </div>

                    {/* Faculty */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Faculty</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green" value={faculty} onChange={e => setFaculty(e.target.value)} required>
                            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    {/* Level */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green" value={level} onChange={e => setLevel(e.target.value)}>
                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resource Type</label>
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green" value={type} onChange={e => setType(e.target.value)}>
                            <option>Lecture Note</option>
                            <option>Past Question</option>
                            <option>Handout</option>
                            <option>Textbook</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black flex items-center justify-center gap-2">
                            {loading ? "Uploading..." : <><Save size={18}/> Publish Resource</>}
                        </button>
                    </div>

                </form>
            </div>

            {/* SEARCH EXISTING FILES */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Search className="text-gray-400" size={18} />
                    <input 
                       type="text" 
                       placeholder="Search uploaded files..." 
                       className="w-full outline-none text-sm"
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase">
                        <tr><th className="p-6">Title</th><th className="p-6">Target</th><th className="p-6 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {resources.map(res => (
                            <tr key={res.id} className="hover:bg-gray-50">
                                <td className="p-6">
                                    <div className="font-bold text-gray-800">{res.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded mr-2">{res.type}</span>
                                        <a href={res.link} target="_blank" className="text-tacsfon-green hover:underline truncate max-w-[150px] inline-block align-bottom">{res.link}</a>
                                    </div>
                                </td>
                                <td className="p-6 text-sm text-gray-600">
                                    <span className="font-bold">{res.faculty}</span>
                                    <br/>
                                    <span className="text-xs">{res.level}</span>
                                </td>
                                <td className="p-6 text-right">
                                    <button onClick={() => handleDelete(res.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                        {resources.length === 0 && (
                            <tr><td colSpan={3} className="p-8 text-center text-gray-400">No resources found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
      </div>
    </AdminGatekeeper>
  );
}