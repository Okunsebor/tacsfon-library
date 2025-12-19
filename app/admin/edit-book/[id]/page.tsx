'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditBook() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '', 
    author: '', 
    category: '', 
    available_copies: 0, 
    cover_url: '', 
    pdf_url: '', 
    summary: ''
  });

  // Fetch existing data
  useEffect(() => {
    async function fetchBook() {
        const { data } = await supabase.from('books').select('*').eq('id', id).single();
        if (data) setFormData(data);
        setLoading(false);
    }
    fetchBook();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('books').update(formData).eq('id', id);

    if (error) {
      alert('Error updating: ' + error.message);
    } else {
      alert('Book updated successfully!');
      // --- FIX: Redirect to '/admin' instead of '/admin/dashboard' ---
      router.push('/admin'); 
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Book Data...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        <div className="flex items-center justify-between mb-8">
            {/* --- FIX: Back button also goes to '/admin' --- */}
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-tacsfon-green font-bold">
                <ArrowLeft size={20} /> Cancel
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Edit Book Details</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
              <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
              <input type="number" value={formData.available_copies} onChange={e => setFormData({...formData, available_copies: parseInt(e.target.value)})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" />
            </div>
          </div>

          {/* GOOGLE DRIVE LINK SECTION */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Google Drive PDF Link</label>
              <input 
                type="text" 
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-400 outline-none font-mono text-sm"
                value={formData.pdf_url || ''}
                onChange={(e) => setFormData({...formData, pdf_url: e.target.value})}
              />
              <p className="text-[10px] text-blue-400 mt-2 font-bold">
                  * Ensure the link permission is set to "Anyone with the link" in Google Drive.
              </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
            <div className="flex gap-4">
                <input type="text" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" />
                {formData.cover_url && <img src={formData.cover_url} className="h-12 w-8 object-cover rounded shadow" />}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Summary</label>
            <textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 h-32 resize-none outline-none" />
          </div>

          <button type="submit" className="w-full bg-tacsfon-green hover:bg-green-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
            <Save size={20} /> Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}