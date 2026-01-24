'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import AdminGatekeeper from '@/app/components/AdminGatekeeper'; // ✅ Added Security
import { Mic, Image as ImageIcon, Video, Link as LinkIcon, ArrowLeft, UploadCloud, FileUp, X, Trash2, Play, Loader } from 'lucide-react';
import Link from 'next/link';

// Define the Data Structure for safety
interface MediaItem {
  id: number;
  title: string;
  type: 'audio' | 'video' | 'image';
  url: string;
  preacher?: string;
  description?: string;
  date_uploaded: string;
}

export default function AdminMediaManager() {
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]); 
  const [uploading, setUploading] = useState(false); // Separate loading state for upload
  
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
    setLoading(true);
    const { data } = await supabase.from('media').select('*').order('date_uploaded', { ascending: false });
    setMediaList(data || []);
    setLoading(false);
  }

  // HANDLE FILE SELECTION
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Clear manual URL if file is selected to avoid confusion
      setFormData({ ...formData, url: '' });
    }
  };

  // HANDLE UPLOAD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.title) return alert("Please enter a title.");

    setUploading(true);

    let finalUrl = formData.url;

    // 1. Handle File Upload (If file selected)
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // Unique name
      const filePath = `${formData.type}s/${fileName}`; // Organize in folders: audios/..., videos/...

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media_files') // Make sure this bucket exists!
        .upload(filePath, selectedFile);

      if (uploadError) {
        alert('Upload Error: ' + uploadError.message);
        setUploading(false);
        return;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media_files')
        .getPublicUrl(filePath);
      
      finalUrl = publicUrl;
    }

    // 2. Validation
    if (!finalUrl) {
      alert("Please either select a file OR enter a direct link.");
      setUploading(false);
      return;
    }

    // 3. Save to Database
    const { error } = await supabase.from('media').insert([{
        title: formData.title,
        type: formData.type,
        url: finalUrl,
        preacher: formData.type === 'audio' ? formData.preacher : null,
        description: formData.description
    }]);

    if (error) {
      alert('Database Error: ' + error.message);
    } else {
      alert('Media published successfully!');
      // Reset Form
      setFormData({ title: '', type: 'audio', url: '', preacher: '', description: '' });
      setSelectedFile(null);
      fetchMedia(); 
    }
    setUploading(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;

    const { error } = await supabase.from('media').delete().eq('id', id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      setMediaList(mediaList.filter(item => item.id !== id));
    }
  };

  return (
    <AdminGatekeeper>
        <div className="min-h-screen bg-gray-50 p-6 md:p-12 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
                        <p className="text-gray-500 text-sm">Upload sermons, videos, and gallery photos.</p>
                    </div>
                </div>

                {/* UPLOAD CARD */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                    
                        {/* Type Selector */}
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {['audio', 'video', 'image'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setFormData({...formData, type: t})}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                        formData.type === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Title Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Content Title</label>
                            <input 
                                type="text" required
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-tacsfon-green focus:ring-2 focus:ring-tacsfon-green/20 outline-none transition-all"
                                placeholder={formData.type === 'audio' ? "e.g. The Spirit of Faith" : "e.g. Fresher's Night Highlight"}
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        {/* Two Columns: File Upload & Manual Link */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Option A: File Upload */}
                            <div className={`p-4 rounded-xl border-2 border-dashed transition-colors ${selectedFile ? 'border-tacsfon-green bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="relative flex flex-col items-center justify-center h-32 cursor-pointer">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept={formData.type === 'image' ? 'image/*' : formData.type === 'audio' ? 'audio/*' : 'video/*'} />
                                    
                                    {selectedFile ? (
                                        <div className="text-center">
                                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2"><FileUp size={20}/></div>
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1 px-2">{selectedFile.name}</p>
                                            <p className="text-xs text-green-600 font-bold mt-1">Ready to upload</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <UploadCloud className="mx-auto text-gray-300 mb-2" size={32} />
                                            <p className="text-sm font-bold text-gray-500">Tap to Upload File</p>
                                            <p className="text-xs text-gray-400 mt-1">MP3, MP4, or JPG</p>
                                        </div>
                                    )}
                                </div>
                                {selectedFile && (
                                    <button type="button" onClick={() => setSelectedFile(null)} className="w-full mt-2 py-1 text-xs font-bold text-red-400 hover:text-red-600">Remove File</button>
                                )}
                            </div>

                            {/* Option B: Manual Link */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">OR Paste External Link</label>
                                <div className="relative">
                                    <LinkIcon size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                                    <input 
                                        type="url" 
                                        disabled={!!selectedFile} // Disable if file is selected
                                        className={`w-full pl-9 p-3 rounded-xl border outline-none text-sm ${selectedFile ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:border-tacsfon-green'}`}
                                        placeholder={formData.type === 'video' ? "https://youtube.com/..." : "https://drive.google.com/..."}
                                        value={formData.url}
                                        onChange={e => setFormData({...formData, url: e.target.value})} 
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                                    Use this for YouTube videos or files hosted on Google Drive. If you selected a file on the left, leave this blank.
                                </p>
                            </div>
                        </div>

                        {/* Extra Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.type === 'audio' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preacher</label>
                                    <input type="text" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none" placeholder="e.g. Pastor Ayomide" value={formData.preacher} onChange={e => setFormData({...formData, preacher: e.target.value})} />
                                </div>
                            )}
                            <div className={formData.type !== 'audio' ? 'col-span-2' : ''}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                                <input type="text" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none" placeholder="Short summary..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                        </div>

                        <button type="submit" disabled={uploading} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg shadow-gray-900/10 flex justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                            {uploading ? <Loader className="animate-spin" /> : <><UploadCloud size={20}/> Publish Media</>}
                        </button>
                    </form>
                </div>

                {/* LIST OF MEDIA */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800">Media Library</h2>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                        {mediaList.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No media uploaded yet.</div>
                        ) : (
                            mediaList.map((item) => (
                                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            item.type === 'audio' ? 'bg-purple-50 text-purple-600' : 
                                            item.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {item.type === 'audio' ? <Mic size={18}/> : item.type === 'video' ? <Video size={18}/> : <ImageIcon size={18}/>}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                                <span>{item.type}</span>
                                                <span>•</span>
                                                <span>{new Date(item.date_uploaded).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a href={item.url} target="_blank" className="p-2 text-gray-400 hover:text-tacsfon-green transition-colors"><LinkIcon size={16}/></a>
                                        <button onClick={() => handleDelete(item.id, item.title)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    </AdminGatekeeper>
  );
}