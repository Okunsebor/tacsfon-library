'use client';
import { useState } from 'react';
import { Play, Music, Image as ImageIcon, Video, Mic } from 'lucide-react';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('sermons');

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
            {['sermons', 'videos', 'gallery'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                  ? 'bg-tacsfon-neonGreen text-black shadow-[0_0_15px_#00FF88]' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT: SERMONS */}
        {activeTab === 'sermons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Example Audio Card */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-tacsfon-neonGreen/50 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-tacsfon-neonGreen group-hover:text-black transition-colors">
                    <Mic size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Walking in Dominion</h3>
                    <p className="text-xs text-gray-400">Pst. Ayomide • 45 mins</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 h-1 rounded-full mb-4 overflow-hidden">
                  <div className="w-1/3 h-full bg-tacsfon-neonGreen"></div>
                </div>
                <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold flex items-center justify-center gap-2 transition-all">
                  <Play size={16} fill="currentColor" /> Play Audio
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CONTENT: VIDEOS */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
             <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <div className="aspect-video bg-black flex items-center justify-center relative group cursor-pointer">
                  <Play size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">Freshers' Welcome 2024</h3>
                  <p className="text-gray-400 text-sm">Highlights from our amazing welcome service.</p>
                </div>
             </div>
          </div>
        )}

        {/* CONTENT: GALLERY */}
        {activeTab === 'gallery' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 animate-fade-in">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="break-inside-avoid rounded-xl overflow-hidden relative group">
                 <img src={`https://picsum.photos/400/${300 + (i * 50)}`} alt="Gallery" className="w-full h-auto" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="text-white" />
                 </div>
               </div>
             ))}
          </div>
        )}

      </div>
    </main>
  );
}