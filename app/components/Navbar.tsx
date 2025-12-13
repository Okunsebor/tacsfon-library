'use client';
import Link from 'next/link';
import { User, ShieldCheck, LogIn, ChevronDown, LayoutGrid } from 'lucide-react'; 
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path ? "text-tacsfon-green font-bold" : "text-gray-600 hover:text-tacsfon-green";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/tacsfon-logo.png" alt="TACSFON Logo" className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            <div className="hidden md:block leading-tight">
              <h1 className="font-bold text-xl text-tacsfon-green tracking-tight">TACSFON</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">National Library System</p>
            </div>
          </Link>

          {/* CENTER MENU */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>Home</Link>
            <Link href="/about" className={`text-sm font-medium transition-colors ${isActive('/about')}`}>About Us</Link>
            
            {/* DROPDOWN */}
            <div className="relative group h-20 flex items-center">
                <button className={`flex items-center gap-1 text-sm font-medium ${isActive('/portals')}`}>
                    Quick Access <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300"/>
                </button>
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-64 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-2">
                        {/* Student Link - UPDATED COLORS (No More Blue) */}
                        <Link href="/#collections" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group/item">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-tacsfon-orange flex items-center justify-center">
                                <LayoutGrid size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">Student Portal</h4>
                                <p className="text-[10px] text-gray-500">Browse Books</p>
                            </div>
                        </Link>
                        {/* Librarian Link */}
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

          {/* SIGN IN BUTTON - UPDATED COLORS */}
          <Link 
            href="/student-login" 
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-tacsfon-orange text-white hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <User size={18} />
            <span className="text-sm font-bold">Student Sign In</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}