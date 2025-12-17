'use client';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Optional: Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/pattern.png')] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative z-10">
        
        {/* BRAND LOGO - Centered at the top */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <img 
              src="/tacsfon-brand.png" 
              alt="TACSFONLIB" 
              className="h-10 w-auto hover:opacity-90 transition-opacity" 
            />
          </Link>
        </div>

        {/* TITLE & SUBTITLE */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        {/* THE FORM CONTENT */}
        {children}
        
      </div>

      {/* FOOTER COPYRIGHT */}
      <div className="absolute bottom-6 text-center w-full text-xs text-gray-400">
        &copy; {new Date().getFullYear()} TACSFON National Library System.
      </div>
    </div>
  );
}