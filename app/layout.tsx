import './globals.css';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import FloatingPlayer from '@/app/components/FloatingPlayer';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import { Plus_Jakarta_Sans } from 'next/font/google';

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
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased selection:bg-[#006838] selection:text-white dark:bg-[#0a0a0a] dark:text-gray-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navbar sits at the top */}
          <Navbar />
          
          {/* Main Content */}
          {children}
          
          {/* The Professional Footer */}
          <Footer />

          {/* 
            FloatingPlayer lives here — OUTSIDE of <main> and after <Footer>.
            Because it is 'fixed' positioned, it floats above all page content
            and survives every client-side route change automatically.
          */}
          <FloatingPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}