import './globals.css';
import Navbar from '@/app/components/Navbar';
import { Inter } from 'next/font/google'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TACSFON Library',
  description: 'The academic and spiritual resource center.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* Navbar sits at the top of every page */}
        <Navbar />
        
        {/* Main Content */}
        {children}
        
        {/* Simple Footer */}
        <footer className="bg-white border-t mt-20 py-10 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TACSFON Library System.</p>
          <p>Excellence in Spirit & Academics.</p>
        </footer>
      </body>
    </html>
  );
}