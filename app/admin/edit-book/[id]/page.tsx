'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditBook() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'link'>('link');
  
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
        if (data) {
          setFormData(data);
          const isSupabase = data.pdf_url?.includes('supabase.co/storage/v1/object/public/books/');
          setUploadMode(isSupabase ? 'upload' : 'link');
        }
        setLoading(false);
    }
    fetchBook();
  }, [id]);

  const handleModeChange = (mode: 'upload' | 'link') => {
    setUploadMode(mode);
    const isSupabase = formData.pdf_url?.includes('supabase.co/storage/v1/object/public/books/');
    if (mode === 'upload' && !isSupabase) {
      setFormData(prev => ({ ...prev, pdf_url: '' }));
    } else if (mode === 'link' && isSupabase) {
      setFormData(prev => ({ ...prev, pdf_url: '' }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.title) {
      alert('Please fill in the Book Title before uploading the PDF so we can name the file correctly.');
      return;
    }

    setUploading(true);
    try {
      const cleanTitle = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const cleanAuthor = formData.author ? formData.author.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : 'unknown';
      const fileName = `${cleanTitle}-${cleanAuthor}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, pdf_url: publicUrl }));
      alert('PDF uploaded successfully!');
    } catch (error: any) {
      alert('Error uploading PDF: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      alert('Please wait for the PDF upload to complete before saving.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('books').update(formData).eq('id', id);

    if (error) {
      alert('Error updating: ' + error.message);
    } else {
      alert('Book updated successfully!');
      router.push('/admin'); 
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Book Data...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-tacsfon-green font-bold">
                <ArrowLeft size={20} /> Cancel
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Edit Book Details</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
              <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
              <input type="number" value={formData.available_copies} onChange={e => setFormData({...formData, available_copies: parseInt(e.target.value) || 0})} className="w-full p-3 rounded-xl border border-gray-200 focus:border-tacsfon-green outline-none" min={0} required />
            </div>
          </div>

          {/* DIGITAL COPY SECTION (SUPABASE UPLOAD vs GOOGLE DRIVE LINK) */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-3">Digital Copy (PDF)</label>
            
            <div className="flex gap-2 mb-4 p-1 bg-gray-200/60 rounded-xl max-w-xs">
              <button
                type="button"
                onClick={() => handleModeChange('upload')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  uploadMode === 'upload'
                    ? 'bg-white text-gray-800 shadow'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('link')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  uploadMode === 'link'
                    ? 'bg-white text-gray-800 shadow'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                External Link
              </button>
            </div>

            {uploadMode === 'upload' ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:border-tacsfon-green transition-colors relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-tacsfon-green animate-spin" />
                      <span className="text-sm text-gray-500 font-bold">Uploading PDF to Supabase...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-sm text-tacsfon-green font-bold hover:underline">
                        Choose PDF file
                      </span>
                      <p className="text-xs text-gray-400 mt-1">PDF files only (Max 50MB)</p>
                    </div>
                  )}
                </div>
                {formData.pdf_url && formData.pdf_url.includes('supabase.co') && (
                  <div className="text-xs text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 break-all font-bold">
                    ✓ Currently linked to uploaded file: <br/>
                    <span className="font-mono text-gray-600 select-all">{formData.pdf_url}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="https://drive.google.com/file/d/... or any direct PDF URL"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-tacsfon-green outline-none font-mono text-sm"
                  value={formData.pdf_url || ''}
                  onChange={(e) => setFormData({...formData, pdf_url: e.target.value})}
                />
                <p className="text-[10px] text-gray-400 font-bold">
                  * Ensure the link permission is set to "Anyone with the link" if using Google Drive.
                </p>
              </div>
            )}
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

          <button type="submit" disabled={uploading} className="w-full bg-tacsfon-green hover:bg-green-700 text-white font-bold text-lg py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Save size={20} /> Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}