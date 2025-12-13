'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Mic, Image as ImageIcon, Video, FileText, Link as LinkIcon, ArrowLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function UploadMedia() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'audio', // Default to sermon
    url: '',
    preacher: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('media').insert([formData]);

    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
      alert('Media content published successfully.');
      router.push('/media'); // Redirect to the public media page to verify
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-tacsfon-green transition-colors font-bold text-sm">
                <ArrowLeft size={18} /> BACK TO DASHBOARD
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Upload Media</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Row 1: Title & Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content Title</label>
              <input 
                type="text" required
                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none font-medium"
                placeholder="e.g. Walking in Dominion"
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Format</label>
              <div className="relative">
                <select 
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none appearance-none font-medium"
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  value={formData.type}
                >
                  <option value="audio">Audio / Sermon</option>
                  <option value="video">Video</option>
                  <option value="image">Photo Gallery</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                  {formData.type === 'audio' && <Mic size={20}/>}
                  {formData.type === 'video' && <Video size={20}/>}
                  {formData.type === 'image' && <ImageIcon size={20}/>}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: URL Link */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Direct Resource Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-4 text-gray-400" size={20} />
              <input 
                type="url" required
                className="w-full pl-12 pr-4 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none font-mono text-sm"
                placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://drive.google.com/file/...'}
                onChange={e => setFormData({...formData, url: e.target.value})}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 ml-1">
              Supports Google Drive direct links, YouTube embeds, or hosted file URLs.
            </p>
          </div>

          {/* Row 3: Preacher (Only for Audio) */}
          {formData.type === 'audio' && (
             <div className="animate-fade-in">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Minister / Preacher</label>
                <input 
                  type="text"
                  className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none"
                  placeholder="e.g. Pastor Ayomide"
                  onChange={e => setFormData({...formData, preacher: e.target.value})}
                />
             </div>
          )}

          {/* Row 4: Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
              <textarea 
                className="w-full pl-12 pr-4 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green outline-none h-32 resize-none"
                placeholder="Brief summary of the content..."
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? 'Publishing...' : (
                <>
                    <UploadCloud size={20} className="text-tacsfon-neonGreen" /> Publish Content
                </>
            )}
          </button>

        </form>
      </div>
    </main>
  );
}