'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Book, User, List, Hash, Image as ImageIcon, FileText, ArrowLeft, Link as LinkIcon, ScanBarcode } from 'lucide-react';
import Link from 'next/link';

export default function AddBook() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    available_copies: 1,
    cover_url: '', 
    summary: '',
    pdf_url: '', // For legal/public domain PDFs
    isbn: '',     // NEW: For Open Library (Modern books)
    ia_id: ''     // NEW: For Internet Archive
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalData = {
      ...formData,
      cover_url: formData.cover_url || 'https://placehold.co/400x600?text=No+Cover',
      summary: formData.summary || 'No summary available.'
    };

    const { error } = await supabase.from('books').insert([finalData]);

    if (error) {
      alert('Error adding book: ' + error.message);
    } else {
      alert('Book added successfully!');
      router.push('/'); 
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
        
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-tacsfon-green transition-colors">
                <ArrowLeft size={20} /> <span className="font-bold">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Add New Book</h1>
            <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Book Title</label>
              <div className="relative">
                <Book className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" required className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none" placeholder="e.g. Atomic Habits" onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" required className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none" placeholder="e.g. James Clear" onChange={e => setFormData({...formData, author: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Category & Copies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <div className="relative">
                <List className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <select className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none appearance-none" onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Religion">Religion</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Available Copies</label>
              <div className="relative">
                <Hash className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="number" min="1" required className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none" value={formData.available_copies} onChange={e => setFormData({...formData, available_copies: parseInt(e.target.value)})} />
              </div>
            </div>
          </div>

          {/* DIGITAL OPTIONS */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
             <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-4">Digital Reading Options</h3>
             
             <div className="space-y-4">
                <label className="block text-xs font-bold text-gray-500 mb-1">Option A: Direct PDF / Google Drive Link (Best for Locked Books)</label>
   {/* ... input field ... */}
   <p className="text-[10px] text-gray-400 mt-1">
      https://drive.google.com/drive/folders/1avdOB6_-WOGj3w_VqrE68_Sn5b6yGKpb?usp=drive_link
   </p>

                {/* Option B: Internet Archive ID */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Option B: Internet Archive Identifier</label>
                   <div className="relative">
                      <ScanBarcode className="absolute left-4 top-3 text-gray-400" size={16} />
                      <input type="text" className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-blue-200 focus:border-blue-500 outline-none text-sm" placeholder="e.g. atomichabits00jame" onChange={e => setFormData({...formData, ia_id: e.target.value})} />
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1">
                     Find this in the URL of the book on archive.org (e.g. archive.org/details/<b>atomichabits00jame</b>)
                   </p>
                </div>
             </div>
          </div>

          {/* Cover URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input type="url" className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none" placeholder="https://example.com/image.jpg" onChange={e => setFormData({...formData, cover_url: e.target.value})} />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Synopsis</label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <textarea className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none h-32 resize-none" placeholder="Enter a brief summary..." onChange={e => setFormData({...formData, summary: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-tacsfon-green hover:bg-green-700 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/30">
            {loading ? 'Saving...' : 'Add Book to Library'}
          </button>

        </form>
      </div>
    </main>
  );
}