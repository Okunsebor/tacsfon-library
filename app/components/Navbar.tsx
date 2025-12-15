'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, ChevronDown, BookOpen, Menu, X } from 'lucide-react'; 
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => setIsOpen(false), [pathname]);
  
  const isActive = (path: string) => pathname === path ? "text-tacsfon-green font-bold" : "text-gray-500 hover:text-tacsfon-green font-medium";

  return (
    <>
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md py-2' : 'bg-white py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> {/* Increased container height */}
            
            {/* --- 1. OFFICIAL BRAND LOGO (INCREASED SIZE) --- */}
            <Link href="/" className="flex items-center">
              <img 
                src="/tacsfon-brand.png" 
                alt="TACSFON Official Logo" 
                className="h-14 md:h-20 w-auto object-contain hover:opacity-90 transition-opacity" 
              />
            </Link>

            {/* --- 2. DESKTOP MENU --- */}
            <div className="hidden lg:flex items-center gap-6 bg-gray-50/50 px-8 py-3 rounded-full border border-gray-100 backdrop-blur-sm">
              <Link href="/" className={isActive('/')}>Home</Link>
              <Link href="/resources" className={isActive('/resources')}>Academic Hub</Link>
              <Link href="/media" className={isActive('/media')}>Media</Link>
              <Link href="/about" className={isActive('/about')}>About Us</Link>

              {/* Quick Access Dropdown */}
              <div className="relative group flex items-center h-full">
                  <button className={`flex items-center gap-1 text-sm ${isActive('/portals')}`}>
                      Quick Access <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
                  </button>
                  <div className="absolute top-[120%] left-1/2 -translate-x-1/2 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-2 ring-1 ring-black/5">
                          <Link href="/#collections" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-orange-100 text-tacsfon-orange flex items-center justify-center"><BookOpen size={16} /></div>
                              <div><h4 className="text-sm font-bold text-gray-800">Browse Books</h4></div>
                          </Link>
                          <Link href="/login" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors mt-1">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-tacsfon-green flex items-center justify-center"><ShieldCheck size={16} /></div>
                              <div><h4 className="text-sm font-bold text-gray-800">Librarian Portal</h4></div>
                          </Link>
                      </div>
                  </div>
              </div>

              <Link href="/contact" className={isActive('/contact')}>Contact</Link>
            </div>

            {/* --- 3. CTA BUTTON --- */}
            <div className="hidden lg:flex items-center">
              <Link href="/student-login" className="group relative px-6 py-2.5 font-bold text-white rounded-full overflow-hidden bg-tacsfon-green shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all">
                <span className="flex items-center gap-2 relative text-sm"><User size={18} /> Student Portal</span>
              </Link>
            </div>

            {/* --- 4. MOBILE MENU BTN --- */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-gray-800">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- 5. MOBILE MENU OVERLAY --- */}
      <div className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-500 lg:hidden flex flex-col pt-24 px-6 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className="space-y-6">
            <Link href="/" className="text-xl font-bold text-gray-900 block" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/resources" className="text-xl font-bold text-gray-900 block" onClick={() => setIsOpen(false)}>Academic Hub</Link>
            <Link href="/media" className="text-xl font-bold text-gray-900 block" onClick={() => setIsOpen(false)}>Media & Sermons</Link>
            <Link href="/about" className="text-xl font-bold text-gray-900 block" onClick={() => setIsOpen(false)}>About Us</Link>
            <Link href="/contact" className="text-xl font-bold text-gray-900 block" onClick={() => setIsOpen(false)}>Contact</Link>
            
            <hr className="border-gray-100"/>
            <Link href="/student-login" className="flex items-center justify-center w-full py-4 bg-tacsfon-green text-white font-bold rounded-2xl text-lg shadow-xl" onClick={() => setIsOpen(false)}>
              Student Sign In
            </Link>
          </div>
      </div>
    </>
  );
}