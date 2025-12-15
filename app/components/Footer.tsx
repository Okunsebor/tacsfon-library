'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-white rounded-full p-1">
                  {/* Ensure this path matches your logo file */}
                  <img src="/tacsfon-logo.png" alt="Logo" className="h-10 w-auto" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">TACSFON</h2>
             </div>
             <p className="text-gray-400 leading-relaxed max-w-sm">
               The Apostolic Church Students' Fellowship of Nigeria. 
               Raising an army of intellectuals and spiritual giants for the Kingdom.
             </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-[#00FF88] mb-6 uppercase tracking-wider text-sm">Navigation</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">Academic Hub</Link></li>
              <li><Link href="/media" className="hover:text-white transition-colors">Media Library</Link></li>
              <li><Link href="/student-login" className="hover:text-white transition-colors">Student Portal</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-[#00FF88] mb-6 uppercase tracking-wider text-sm">Contact Us</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start gap-3">
                 <MapPin size={20} className="shrink-0 text-gray-500" />
                 <span>FUTMINNA Chapter,<br/>Gidan Kwano Campus</span>
              </li>
              <li className="flex items-center gap-3">
                 <Mail size={20} className="shrink-0 text-gray-500" />
                 <span>library@tacsfon.org</span>
              </li>
              <li className="flex items-center gap-3">
                 <Phone size={20} className="shrink-0 text-gray-500" />
                 <span>+234 800 000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-sm text-gray-600">© 2025 TACSFON FUTMINNA. All rights reserved.</p>
           <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#006838] hover:text-white transition-all"><Facebook size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#006838] hover:text-white transition-all"><Instagram size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#006838] hover:text-white transition-all"><Twitter size={18}/></a>
           </div>
        </div>
      </div>
    </footer>
  );
}