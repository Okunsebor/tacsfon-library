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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => setIsOpen(false), [pathname]);
  
  const isActive = (path: string) => pathname === path ? "text-tacsfon-green font-bold" : "text-gray-500 hover:text-tacsfon-green font-medium";

  return (
    <>
      {/* --- FIX APPLIED: 'py-1' removes the white space above/below. --- */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'} py-1 border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* --- FIX APPLIED: Fixed height (h-14 mobile, h-16 desktop) --- */}
          <div className="flex justify-between items-center h-14 md:h-16"> 
            
            {/* 1. BRAND LOGO (Tighter fit) */}
            <Link href="/" className="flex items-center">
              <img 
                src="/tacsfon-brand.png" 
                alt="TACSFON Official Logo" 
                className="h-8 md:h-10 w-auto object-contain hover:opacity-90 transition-opacity" 
              />
            </Link>

            {/* 2. DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/" className={`text-sm ${isActive('/')}`}>Home</Link>
              <Link href="/resources" className={`text-sm ${isActive('/resources')}`}>Academic Hub</Link>
              <Link href="/media" className={`text-sm ${isActive('/media')}`}>Media</Link>
              <Link href="/about" className={`text-sm ${isActive('/about')}`}>About Us</Link>

              {/* Quick Access Dropdown */}
              <div className="relative group flex items-center h-full">
                  <button className={`flex items-center gap-1 text-sm ${isActive('/portals')}`}>
                      Quick Access <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
                  </button>
                  <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-2 ring-1 ring-black/5">
                          <Link href="/#collections" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-orange-100 text-tacsfon-orange flex items-center justify-center"><BookOpen size={16} /></div>
                              <div><h4 className="text-sm font-bold text-gray-800">Browse Books</h4></div>
                          </Link>
                          <Link href="/login" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors mt-1">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-tacsfon-green flex items-center justify-center"><ShieldCheck size={16} /></div>
                              <div><h4 className="text-sm font-bold text-gray-800">Librarian Portal</h4></div>
                          </Link>
                      </div>
                  </div>
              </div>

              <Link href="/contact" className={`text-sm ${isActive('/contact')}`}>Contact</Link>
            </div>

            {/* 3. CTA BUTTON */}
            <div className="hidden lg:flex items-center">
              <Link href="/student-login" className="group relative px-5 py-2 font-bold text-white rounded-full overflow-hidden bg-tacsfon-green shadow-lg shadow-green-900/20 hover:shadow-green-900/40 transition-all">
                <span className="flex items-center gap-2 relative text-xs"><User size={16} /> Student Portal</span>
              </Link>
            </div>

            {/* 4. MOBILE MENU BTN */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-gray-800">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* 5. MOBILE MENU OVERLAY */}
      <div className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-500 lg:hidden flex flex-col pt-20 px-6 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
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