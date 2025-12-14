'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, ChevronDown, LayoutGrid, Menu, X, BookOpen } from 'lucide-react'; 
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // State for Mobile Menu

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  const isActive = (path: string) => pathname === path ? "text-tacsfon-green font-bold" : "text-gray-600 hover:text-tacsfon-green";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-3 group z-50">
            <img src="/tacsfon-logo.png" alt="TACSFON Logo" className="h-10 md:h-12 w-auto object-contain" />
            <div className="block leading-tight">
              <h1 className="font-bold text-lg md:text-xl text-tacsfon-green tracking-tight">TACSFON</h1>
              <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest font-semibold">National Library System</p>
            </div>
          </Link>

          {/* 2. DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>Home</Link>
            
            {/* NEW: ACADEMIC HUB LINK */}
            <Link href="/resources" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/resources')}`}>
                <BookOpen size={16} className={pathname === '/resources' ? "text-tacsfon-green" : "text-gray-400"} /> 
                Academic Hub
            </Link>

            <Link href="/media" className={`text-sm font-medium transition-colors ${isActive('/media')}`}>Media</Link>
            <Link href="/about" className={`text-sm font-medium transition-colors ${isActive('/about')}`}>About Us</Link>
            
            {/* Desktop Dropdown */}
            <div className="relative group h-20 flex items-center">
                <button className={`flex items-center gap-1 text-sm font-medium ${isActive('/portals')}`}>
                    Quick Access <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
                </button>
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-2">
                        <Link href="/#collections" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group/item">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-tacsfon-orange flex items-center justify-center">
                                <LayoutGrid size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">Browse Books</h4>
                                <p className="text-[10px] text-gray-500">General Library</p>
                            </div>
                        </Link>
                        <Link href="/login" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group/item mt-1">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-tacsfon-green flex items-center justify-center">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">Librarian Portal</h4>
                                <p className="text-[10px] text-gray-500">Staff Access Only</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
            <Link href="/contact" className={`text-sm font-medium transition-colors ${isActive('/contact')}`}>Contact</Link>
          </div>

          {/* 3. DESKTOP BUTTONS */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/student-login" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-tacsfon-orange text-white hover:bg-orange-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <User size={18} /> <span className="text-sm font-bold">Student Sign In</span>
            </Link>
          </div>

          {/* 4. MOBILE MENU BUTTON */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 5. MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-2xl animate-fade-in z-40 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-4 space-y-2">
            
            {/* Main Links */}
            <Link href="/" className={`block p-4 rounded-xl text-lg font-medium ${isActive('/') ? 'bg-green-50 text-tacsfon-green' : 'text-gray-700 hover:bg-gray-50'}`}>
              Home
            </Link>
            
            {/* NEW: MOBILE ACADEMIC LINK */}
            <Link href="/resources" className={`block p-4 rounded-xl text-lg font-medium ${isActive('/resources') ? 'bg-green-50 text-tacsfon-green' : 'text-gray-700 hover:bg-gray-50'}`}>
              Academic Hub
            </Link>

            <Link href="/media" className={`block p-4 rounded-xl text-lg font-medium ${isActive('/media') ? 'bg-green-50 text-tacsfon-green' : 'text-gray-700 hover:bg-gray-50'}`}>
              Media & Sermons
            </Link>
            <Link href="/about" className={`block p-4 rounded-xl text-lg font-medium ${isActive('/about') ? 'bg-green-50 text-tacsfon-green' : 'text-gray-700 hover:bg-gray-50'}`}>
              About Us
            </Link>
            <Link href="/contact" className={`block p-4 rounded-xl text-lg font-medium ${isActive('/contact') ? 'bg-green-50 text-tacsfon-green' : 'text-gray-700 hover:bg-gray-50'}`}>
              Contact
            </Link>

            {/* Quick Access Section */}
            <div className="my-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Portals</p>
                <Link href="/#collections" className="flex items-center gap-3 p-3 rounded-xl bg-white mb-2 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-tacsfon-orange flex items-center justify-center"><LayoutGrid size={16} /></div>
                    <span className="font-bold text-gray-700">Browse Books</span>
                </Link>
                <Link href="/login" className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-tacsfon-green flex items-center justify-center"><ShieldCheck size={16} /></div>
                    <span className="font-bold text-gray-700">Librarian Portal</span>
                </Link>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3 pt-2">
                <Link href="/student-login" className="w-full flex justify-center items-center gap-2 py-4 rounded-xl bg-tacsfon-orange text-white font-bold shadow-lg">
                   <User size={18} /> Student Sign In
                </Link>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}