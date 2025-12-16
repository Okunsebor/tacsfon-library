'use client';
import Link from 'next/link';
import { CheckCircle, Circle } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  currentStep?: 'details' | 'verify'; // Optional for sign-in page
  isSignUp?: boolean; // To show/hide steps
}

export default function AuthLayout({ children, title, subtitle, currentStep, isSignUp = false }: AuthLayoutProps) {
  
  const Step = ({ step, label, icon: Icon }: { step: 'details' | 'verify', label: string, icon: any }) => {
    const isActive = currentStep === step;
    const isCompleted = currentStep === 'verify' && step === 'details';

    return (
      <div className={`flex items-center gap-4 ${isActive ? 'text-tacsfon-neonGreen' : isCompleted ? 'text-tacsfon-green' : 'text-gray-500'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-tacsfon-neonGreen bg-tacsfon-neonGreen/10' : isCompleted ? 'border-tacsfon-green bg-tacsfon-green text-white' : 'border-gray-600'}`}>
          {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
        </div>
        <span className="font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* LEFT SIDE: BRANDING & STEPS (Desktop Only) */}
      <div className="hidden lg:flex w-1/3 bg-tacsfon-dark p-12 flex-col justify-between relative overflow-hidden">
        {/* Ensure you have a pattern.png in public or remove this line */}
        <div className="absolute inset-0 opacity-5 bg-[url('/pattern.png')]"></div> 
        <div className="relative z-10">
          <Link href="/">
            {/* Ensure tacsfon-brand.png is in your public folder */}
            <img src="/tacsfon-brand.png" alt="TACSFON Logo" className="h-12 w-auto mb-20" />
          </Link>
          
          {isSignUp && (
            <div className="space-y-8">
              <Step step="details" label="Your details" icon={Circle} />
              <div className={`h-12 w-0.5 ml-5 ${currentStep === 'verify' ? 'bg-tacsfon-green' : 'bg-gray-700'}`}></div>
              <Step step="verify" label="Verify your email" icon={Circle} />
            </div>
          )}
        </div>
        <div className="relative z-10 text-gray-400 text-sm">
          © {new Date().getFullYear()} TACSFON National Library System.
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
            <p className="mt-2 text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}