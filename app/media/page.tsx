'use client';
import { useState, useEffect } from 'react';
import { Play, Music, Image as ImageIcon, Video, Mic, Loader } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('audio'); // 'audio', 'video', 'image'
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH MEDIA FROM DATABASE
  useEffect(() => {
    async function fetchMedia() {
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('date_uploaded', { ascending: false });
      
      setMediaItems(data || []);
      setLoading(false);
    }
    fetchMedia();
  }, []);

  // Filter items based on the active tab
  const filteredItems = mediaItems.filter(item => item.type === activeTab);

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20">
      
      {/* HERO HEADER */}
      <div className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tacsfon-green/20 to-gray-900 z-0"></div>
        <div className="text-center z-10 px-4">
          <span className="text-tacsfon-neonOrange font-bold tracking-widest text-sm uppercase mb-2 block">TACSFON Multimedia</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Fellowship Media</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Sermons, worship sessions, and memories from our gatherings.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* TABS */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800 p-1 rounded-2xl inline-flex">
            {['audio', 'video', 'image'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                  ? 'bg-tacsfon-neonGreen text-black shadow-[0_0_15px_#00FF88]' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'audio' ? 'Sermons' : tab === 'image' ? 'Gallery' : 'Videos'}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-tacsfon-neonGreen" size={40} />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p>No content uploaded in this category yet.</p>
          </div>
        )}

        {/* CONTENT: AUDIO / SERMONS */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-tacsfon-neonGreen/50 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-tacsfon-neonGreen group-hover:text-black transition-colors">
                    <Mic size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.preacher || 'TACSFON Ministration'}</p>
                  </div>
                </div>
                {/* Audio Player */}
                <audio controls className="w-full mt-2 h-8 opacity-80 hover:opacity-100 transition-opacity">
                  <source src={item.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-gray-500 mt-3 line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* CONTENT: VIDEOS */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
             {filteredItems.map((item) => (
               <div key={item.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 group">
                  {/* Handle YouTube vs Direct Links roughly */}
                  <div className="aspect-video bg-black">
                    <iframe 
                      src={item.url} 
                      className="w-full h-full" 
                      title={item.title} 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* CONTENT: GALLERY */}
        {activeTab === 'image' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 animate-fade-in">
             {filteredItems.map((item) => (
               <div key={item.id} className="break-inside-avoid rounded-xl overflow-hidden relative group">
                 <img src={item.url} alt={item.title} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-300">{item.description}</p>
                 </div>
               </div>
             ))}
          </div>
        )}

      </div>
    </main>
  );
}