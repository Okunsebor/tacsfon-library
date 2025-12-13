'use client';
import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-gray-50 py-20 text-center animate-fade-in border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-tacsfon-orange font-bold tracking-widest text-sm uppercase mb-4 block">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-tacsfon-green mb-6 tracking-tight">
            About TACSFON Library
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Nurturing minds and spirits through a curated collection of academic and faith-based resources.
          </p>
        </div>
      </div>

      {/* 2. SPLIT SECTION: OUR MISSION (Image Left, Text Right) */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl animate-slide-up border-4 border-white">
            <img 
              src="/about-mission.jpg" 
              alt="Students studying in the library" 
              className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Text Side */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              Bridging Faith & <span className="text-tacsfon-green">Academia</span>
            </h2>
            <div className="w-20 h-1.5 bg-tacsfon-orange rounded-full"></div>
            <p className="text-gray-600 leading-loose text-lg">
              Our mission is to provide a holistic resource center that supports both the intellectual rigor of university life and the spiritual depth of the Christian faith. We believe these journeys are interconnected, not separate.
            </p>
            <p className="text-gray-600 leading-loose text-lg">
              Through this digital archive, we make essential textbooks, research materials, and enriching spiritual literature accessible to every member of our community, anytime, anywhere.
            </p>
          </div>

        </div>
      </section>

      {/* 3. SPLIT SECTION: OUR LEGACY (Text Left, Image Right) */}
      <section className="bg-tacsfon-softGreen/40 py-24 border-y border-tacsfon-green/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            {/* Text Side (First on Desktop) */}
            <div className="order-2 md:order-1 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                A Foundation of <span className="text-tacsfon-orange">Knowledge</span>
              </h2>
              <div className="w-20 h-1.5 bg-tacsfon-green rounded-full"></div>
              <p className="text-gray-600 leading-loose text-lg">
                What began as a modest collection of donated books has grown into a vital institution. We are custodians of knowledge, preserving timeless truths while embracing modern accessibility.
              </p>
              <ul className="space-y-4 mt-6">
                {['Curated Academic Resources', 'Enriching Spiritual Literature', 'Digital Accessibility for All'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-700 font-bold text-lg">
                    <div className="w-8 h-8 rounded-full bg-tacsfon-green text-white flex items-center justify-center shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Image Side */}
            <div className="order-1 md:order-2 relative h-[450px] rounded-3xl overflow-hidden shadow-2xl animate-slide-up border-4 border-white" style={{ animationDelay: '0.3s' }}>
               <img 
                  src="/about-legacy.jpg" 
                  alt="Stack of classic books" 
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                />
            </div>

          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <div className="text-center py-24 px-4 bg-white">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Explore Our Resources</h2>
        <Link 
          href="/#collections" 
          className="inline-block bg-tacsfon-orange hover:bg-orange-600 text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-orange-500/40"
        >
          Browse the Library
        </Link>
      </div>

    </main>
  );
}