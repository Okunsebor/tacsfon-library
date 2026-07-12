'use client';
import { useState, useRef } from 'react';
import { Volume2, VolumeX, Maximize2, X, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useEvents } from '@/features/events/hooks/useEvents';

export default function EventShowcase() {
  const {
    events,
    expandedId,
    setExpandedId,
    expandedEvent,
    loading
  } = useEvents();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Audio
  const toggleAudio = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); 
    if (!url) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  if (events.length === 0) return null;

  return (
    <section className="py-6 border-b border-gray-100 bg-white">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Upcoming Events</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Scroll to see more &rarr;</span>
        </div>

        {/* --- HORIZONTAL SCROLL STRIP --- */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
            {events.map((event) => (
                <div 
                    key={event.id}
                    onClick={() => setExpandedId(event.id)}
                    className="snap-center shrink-0 w-[140px] md:w-[180px] aspect-[3/4] relative rounded-2xl overflow-hidden cursor-pointer shadow-md border border-gray-100 group hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    <Image 
                        src={event.image_url} 
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Compact Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8">
                        <p className="text-white text-xs font-bold line-clamp-2 leading-tight mb-1">{event.title}</p>
                        <p className="text-gray-300 text-[10px] font-medium">
                            {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Audio Indicator (Top Right) */}
                    {event.audio_url && (
                        <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                            <Volume2 size={12} />
                        </div>
                    )}
                </div>
            ))}
        </div>

      </div>

      {/* --- FULLSCREEN LIGHTBOX (When Clicked) --- */}
      {expandedEvent && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setExpandedId(null)}>
            
            {/* Close Button */}
            <button onClick={() => setExpandedId(null)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-50">
                <X size={32} />
            </button>

            <div className="relative w-full max-w-md bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                {/* Large Image */}
                <div className="relative w-full aspect-[4/5] bg-black">
                     <Image 
                        src={expandedEvent.image_url} 
                        alt={expandedEvent.title}
                        fill
                        className="object-contain"
                     />
                </div>

                {/* Details Footer */}
                <div className="p-6 bg-gray-900 border-t border-white/10">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{expandedEvent.title}</h3>
                            <p className="text-gray-400 text-sm flex items-center gap-2">
                                <Calendar size={14} />
                                {new Date(expandedEvent.event_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Play Audio Button */}
                    {expandedEvent.audio_url && (
                        <button 
                            onClick={(e) => toggleAudio(e, expandedEvent.audio_url)}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isPlaying ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                            {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            {isPlaying ? 'Stop Audio' : 'Play Event Jingle'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

    </section>
  );
}