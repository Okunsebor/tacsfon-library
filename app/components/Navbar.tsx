'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, ChevronDown, Menu, X, Home, LayoutDashboard, BookOpen, Mic2, Info, Phone, LogIn } from 'lucide-react'; 
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Ensure you have this import for auth check

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check auth for "My Dashboard" visibility logic
  useEffect(() => {
    async function getUser() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }
    getUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when route changes
  useEffect(() => setIsOpen(false), [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);
  
  const isActive = (path: string) => pathname === path ? "text-tacsfon-green font-bold" : "text-gray-500 hover:text-tacsfon-green font-medium";

  return (
    <>
      {/* ======================= PC / DESKTOP VIEW (UNCHANGED) ======================= */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'} py-1 border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex justify-between items-center h-14 md:h-16"> 
            
            {/* 1. BRAND LOGO */}
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
                          <Link href="/student-login" className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-tacsfon-green flex items-center justify-center"><User size={16} /></div>
                              <div><h4 className="text-sm font-bold text-gray-800">Student Portal</h4></div>
                          </Link>
                          <Link href="/admin/login" className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors mt-1">
                              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><ShieldCheck size={16} /></div>
                              <div><h4 className="text-sm font-bold text-gray-800">Librarian Portal</h4></div>
                          </Link>
                      </div>
                  </div>
              </div>

              <Link href="/contact" className={`text-sm ${isActive('/contact')}`}>Contact</Link>
            </div>

            {/* 3. RIGHT SIDE: USER DASHBOARD ICON */}
            <div className="hidden lg:flex items-center">
              <Link 
                href="/dashboard" 
                className="p-2 rounded-full text-gray-400 hover:bg-gray-50 hover:text-tacsfon-green transition-all"
                title="Go to Dashboard"
              >
                <User size={24} />
              </Link>
            </div>

            {/* 4. MOBILE MENU BTN */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-gray-800 focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ======================= 5. NEW FUTURISTIC MOBILE MENU OVERLAY ======================= */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-500 ease-in-out lg:hidden flex flex-col pt-24 px-6 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Background Decorative Element (The "Futuristic" Blob) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="flex flex-col h-full overflow-y-auto pb-10 relative z-10">
            
            {/* PRIMARY NAVIGATION */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menu</p>
                
                <MobileLink href="/" icon={<Home size={22}/>} label="Home" />
                
                {/* My Dashboard - Close to Home */}
                {user && (
                  <MobileLink href="/dashboard" icon={<LayoutDashboard size={22}/>} label="Dashboard" active />
                )}

                <MobileLink href="/resources" icon={<BookOpen size={22}/>} label="Academic Hub" />
                <MobileLink href="/media" icon={<Mic2 size={22}/>} label="Media & Sermons" />
            </div>

            <hr className="my-6 border-gray-100" />

            {/* SECONDARY NAVIGATION */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Support</p>
                <MobileLink href="/about" icon={<Info size={22}/>} label="About Us" />
                <MobileLink href="/contact" icon={<Phone size={22}/>} label="Contact Us" />
            </div>

            {/* PORTALS (Bottom of menu) */}
            <div className="mt-auto pt-8 space-y-4">
                {/* Student Sign In (Green) */}
                <Link href="/student-login" className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform">
                   <LogIn size={20} /> Student Sign In
                </Link>

                {/* Librarian Portal (Orange) */}
                <Link href="/admin/login" className="flex items-center justify-center gap-3 w-full bg-orange-50 text-orange-600 py-4 rounded-2xl font-bold text-lg border border-orange-100 hover:bg-orange-100 transition-colors">
                   <ShieldCheck size={20} /> Librarian Portal
                </Link>
            </div>

          </div>
      </div>
    </>
  );
}

// --- Helper Component for consistent Mobile Links ---
function MobileLink({ href, icon, label, active = false }: { href: string, icon: any, label: string, active?: boolean }) {
  return (
      <Link 
          href={href} 
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-green-50 text-tacsfon-green font-extrabold' : 'text-gray-700 font-bold hover:bg-gray-50'}`}
      >
          <span className={`${active ? 'text-tacsfon-green' : 'text-gray-400'}`}>{icon}</span>
          <span className="text-lg tracking-tight">{label}</span>
      </Link>
  );
}