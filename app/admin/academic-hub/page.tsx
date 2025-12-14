'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Folder, Save, ArrowLeft, Trash2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function AcademicHubAdmin() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    faculty: 'SEET', // Default
    department: 'General'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('academic_resources').insert([formData]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Folder linked successfully!");
      setFormData({ ...formData, title: '', link: '' }); // Clear text fields
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="text-gray-500 hover:text-tacsfon-green font-bold flex gap-2">
                <ArrowLeft size={20} /> Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Link Department Folder</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Resource Title</label>
            <input 
              type="text" required
              className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
              placeholder="e.g. 400L Computer Engineering Materials"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Drive Link */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Google Drive Folder Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-4 text-gray-400" size={20} />
              <input 
                type="url" required
                className="w-full pl-12 pr-4 p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none text-blue-600 underline"
                placeholder="https://drive.google.com/drive/folders/..."
                value={formData.link}
                onChange={e => setFormData({...formData, link: e.target.value})}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Make sure the Drive folder is set to "Anyone with the link can view".</p>
          </div>

          {/* Faculty & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Faculty</label>
               <select 
                 className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                 value={formData.faculty}
                 onChange={e => setFormData({...formData, faculty: e.target.value})}
               >
                 <option value="SEET">SEET (Engineering)</option>
                 <option value="SAAT">SAAT (Agriculture)</option>
                 <option value="SIPET">SIPET (Physical Sciences)</option>
                 <option value="SLS">SLS (Life Sciences)</option>
                 <option value="SET">SET (Environmental Tech)</option>
                 <option value="SICT">SICT (Info & Comm Tech)</option>
                 <option value="SSTE">SSTE (Science Tech Ed)</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Department</label>
               <input 
                 type="text" required
                 className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                 placeholder="e.g. Mechatronics"
                 value={formData.department}
                 onChange={e => setFormData({...formData, department: e.target.value})}
               />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-tacsfon-green text-white font-bold text-lg py-4 rounded-xl shadow-lg flex justify-center gap-2 hover:bg-green-700 transition-all">
             {loading ? 'Linking...' : <><Folder size={20}/> Link Folder</>}
          </button>

        </form>
      </div>
    </main>
  );
}