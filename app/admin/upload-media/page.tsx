'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Mic, Image as ImageIcon, Video, FileText, Link as LinkIcon, ArrowLeft, UploadCloud, FileUp, X, Trash2, Play } from 'lucide-react';
import Link from 'next/link';

export default function UploadMedia() {
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState<any[]>([]); // To store existing media
  const router = useRouter();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'audio',
    url: '',
    preacher: '',
    description: ''
  });

  // FETCH MEDIA ON LOAD
  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    const { data } = await supabase.from('media').select('*').order('date_uploaded', { ascending: false });
    setMediaList(data || []);
  }

  // HANDLE FILE SELECTION
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFormData({ ...formData, url: '' });
    }
  };

  // HANDLE UPLOAD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalUrl = formData.url;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${formData.type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media_files')
        .upload(filePath, selectedFile);

      if (uploadError) {
        alert('Upload Error: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media_files')
        .getPublicUrl(filePath);
      
      finalUrl = publicUrl;
    }

    if (!finalUrl) {
      alert("Please either select a file OR enter a direct link.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('media').insert([{
        ...formData,
        url: finalUrl
    }]);

    if (error) {
      alert('Database Error: ' + error.message);
    } else {
      alert('Media published successfully!');
      // Reset Form
      setFormData({ title: '', type: 'audio', url: '', preacher: '', description: '' });
      setSelectedFile(null);
      fetchMedia(); // Refresh list immediately
    }
    setLoading(false);
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;

    const { error } = await supabase.from('media').delete().eq('id', id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      // Update UI without refreshing
      setMediaList(mediaList.filter(item => item.id !== id));
      alert("Deleted successfully.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-tacsfon-green font-bold text-sm">
                <ArrowLeft size={18} /> BACK TO DASHBOARD
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Media Manager</h1>
        </div>

        {/* SECTION 1: UPLOAD FORM */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Upload New Content</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                <input 
                    type="text" required
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                    placeholder="e.g. Walking in Dominion"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Format</label>
                <div className="relative">
                    <select 
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none appearance-none"
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    value={formData.type}
                    >
                    <option value="audio">Audio / Sermon</option>
                    <option value="video">Video</option>
                    <option value="image">Photo Gallery</option>
                    </select>
                </div>
                </div>
            </div>

            {/* File Input */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                {!selectedFile ? (
                <div className="relative group cursor-pointer h-24 flex items-center justify-center border-2 border-dashed border-blue-200 rounded-lg hover:bg-white transition-colors">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept={formData.type === 'image' ? 'image/*' : formData.type === 'audio' ? 'audio/*' : 'video/*'} />
                    <div className="text-center text-blue-500 font-bold text-sm flex gap-2 items-center"><FileUp size={18}/> Tap to Upload File</div>
                </div>
                ) : (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                        <span className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</span>
                        <button type="button" onClick={() => setSelectedFile(null)}><X size={18} className="text-red-400"/></button>
                    </div>
                )}
            </div>

            {/* Manual Link */}
            {!selectedFile && (
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">OR Paste Link (YouTube/Drive)</label>
                    <input type="url" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none text-sm" placeholder="https://..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                </div>
            )}

            {/* Preacher (Audio Only) */}
            {formData.type === 'audio' && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preacher</label>
                    <input type="text" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none" placeholder="e.g. Pastor Ayomide" value={formData.preacher} onChange={e => setFormData({...formData, preacher: e.target.value})} />
                </div>
            )}

            {/* Description */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                <textarea className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none h-20 resize-none" placeholder="Brief summary..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg flex justify-center gap-2">
                {loading ? 'Uploading...' : <><UploadCloud size={20}/> Publish Media</>}
            </button>
            </form>
        </div>

        {/* SECTION 2: MANAGE EXISTING MEDIA (The Delete List) */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">Existing Library ({mediaList.length})</h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {mediaList.length === 0 ? <p className="text-gray-400 text-center py-4">No files yet.</p> : 
                 mediaList.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                item.type === 'audio' ? 'bg-purple-100 text-purple-600' : 
                                item.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                                {item.type === 'audio' ? <Mic size={18}/> : item.type === 'video' ? <Video size={18}/> : <ImageIcon size={18}/>}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm truncate max-w-[180px] md:max-w-[300px]">{item.title}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{item.type} • {new Date(item.date_uploaded).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <a href={item.url} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="View"><Play size={16}/></a>
                            <button 
                                onClick={() => handleDelete(item.id, item.title)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Delete Permanently"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </main>
  );
}