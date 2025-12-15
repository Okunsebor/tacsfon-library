import './globals.css';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer'; // We will create this next
import { Plus_Jakarta_Sans } from 'next/font/google'; // Premium Font Upgrade

// Configure the Professional Font
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta', 
});

export const metadata = {
  title: 'TACSFON National Library',
  description: 'The academic and spiritual resource center for the fellowship.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased selection:bg-[#006838] selection:text-white">
        {/* Navbar sits at the top */}
        <Navbar />
        
        {/* Main Content */}
        {children}
        
        {/* The Professional Footer */}
        <Footer />
      </body>
    </html>
  );
}