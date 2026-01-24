'use client';
import { useState, useEffect } from 'react';
import { Play, Mic, Loader, Download, Image as ImageIcon, Video } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/app/components/Navbar'; // ✅ Added Navigation

// ✅ Define the shape of your data for safety
interface MediaItem {
  id: number;
  title: string;
  description: string;
  url: string;
  type: 'audio' | 'video' | 'image';
  preacher?: string; // Optional, mainly for sermons
  date_uploaded: string;
}

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'image'>('audio'); 
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH MEDIA FROM DATABASE
  useEffect(() => {
    async function fetchMedia() {
      const { data, error } = await supabase
        .from('media') // Ensure you have created this table in Supabase!
        .select('*')
        .order('date_uploaded', { ascending: false });
      
      if (error) {
        console.error("Error fetching media:", error);
      } else {
        setMediaItems(data || []);
      }
      setLoading(false);
    }
    fetchMedia();
  }, []);

  // --- THE ULTIMATE YOUTUBE FIXER ---
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('/shorts/')) return `https://www.youtube.com/embed/${url.split('/shorts/')[1]?.split('?')[0]}`;
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`;
    if (url.includes('v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
    return url; 
  };

  const filteredItems = mediaItems.filter(item => item.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 font-sans">
      <Navbar /> {/* ✅ Standard Navigation added */}
      
      {/* HERO HEADER */}
      <div className="relative pt-24 pb-12 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tacsfon-green/10 to-gray-900 z-0 pointer-events-none"></div>
        <div className="text-center z-10 px-4 mt-8">
          <span className="text-tacsfon-green font-bold tracking-widest text-xs uppercase mb-3 block">TACSFON Multimedia</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">Media & Sermons</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">Stream sermons, watch recorded services, and view gallery moments.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TABS */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-2xl inline-flex border border-gray-700">
            {[
              { id: 'audio', label: 'Sermons', icon: <Mic size={18} /> },
              { id: 'video', label: 'Videos', icon: <Video size={18} /> },
              { id: 'image', label: 'Gallery', icon: <ImageIcon size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                  ? 'bg-tacsfon-green text-white shadow-lg shadow-green-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader className="animate-spin text-tacsfon-green mb-4" size={40} />
                <p className="text-gray-500 text-sm">Loading media library...</p>
            </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-800">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                <Play size={24} />
            </div>
            <p className="text-gray-400 font-bold">No content found in this category.</p>
            <p className="text-gray-600 text-sm mt-1">Check back later for updates.</p>
          </div>
        )}

        {/* CONTENT: AUDIO */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-tacsfon-green transition-all group hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-tacsfon-green shrink-0 group-hover:bg-tacsfon-green group-hover:text-white transition-colors">
                      <Mic size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1 text-gray-100">{item.title}</h3>
                      <p className="text-xs text-tacsfon-green font-bold mt-1 uppercase tracking-wide">{item.preacher || 'Ministration'}</p>
                  </div>
                </div>
                
                {/* Custom Styled Audio Container */}
                <audio controls className="w-full mt-2 h-10 rounded-lg opacity-90 hover:opacity-100 transition-opacity">
                    <source src={item.url} type="audio/mpeg" />
                </audio>
                
                <div className="flex justify-between items-center mt-5 border-t border-gray-700 pt-4">
                    <p className="text-xs text-gray-500 line-clamp-1 max-w-[70%]">{item.description}</p>
                    <a 
                        href={item.url} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-700 hover:bg-white hover:text-black rounded-full transition-colors" 
                        title="Download Sermon"
                    >
                        <Download size={16}/>
                    </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTENT: VIDEOS */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
             {filteredItems.map((item) => (
               <div key={item.id} className="bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl">
                  <div className="aspect-video bg-black relative">
                    <iframe 
                      src={getEmbedUrl(item.url)} 
                      className="w-full h-full absolute inset-0" 
                      title={item.title} 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-white">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description || "No description provided."}</p>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* CONTENT: GALLERY */}
        {activeTab === 'image' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 animate-fade-in">
             {filteredItems.map((item) => (
               <div key={item.id} className="break-inside-avoid rounded-xl overflow-hidden relative group cursor-pointer">
                 <img src={item.url} alt={item.title} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h4 className="font-bold text-white text-sm">{item.title}</h4>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}