'use client';

import { useState, Suspense } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Book, GraduationCap, School, ChevronRight, Edit3 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ... (Your FACULTIES constant goes here) ...
const FACULTIES = {
  "SAAT": {
    name: "School of Agriculture & Agricultural Tech",
    depts: ["Agricultural Economics", "Agricultural Extension", "Animal Production", "Crop Production", "Food Science & Technology", "Soil Science", "Water Resources & Fisheries"]
  },
  "SEET": {
    name: "School of Electrical & Engineering Tech",
    depts: ["Computer Engineering", "Electrical/Electronics Engineering", "Mechatronics Engineering", "Telecommunication Engineering"]
  },
  "SIPET": {
    name: "School of Infrastructure, Process Eng & Tech",
    depts: ["Agricultural & Bioresources Eng", "Chemical Engineering", "Civil Engineering", "Mechanical Engineering", "Material & Metallurgical Eng"]
  },
  "SIT": {
    name: "School of Innovative Technology",
    depts: ["Entrepreneurship", "Logistics & Transport Management", "Project Management Technology"]
  },
  "SET": {
    name: "School of Environmental Technology",
    depts: ["Architecture", "Building Technology", "Estate Management", "Quantity Surveying", "Surveying & Geoinformatics", "Urban & Regional Planning"]
  },
  "SLS": {
    name: "School of Life Sciences",
    depts: ["Animal Biology", "Biochemistry", "Microbiology", "Plant Biology"]
  },
  "SPS": {
    name: "School of Physical Sciences",
    depts: ["Chemistry", "Geography", "Geology", "Mathematics", "Physics", "Statistics"]
  },
  "SICT": {
    name: "School of ICT",
    depts: ["Computer Science", "Cyber Security Science", "Information Technology", "Info & Media Technology"]
  },
  "SSTE": {
    name: "School of Science & Tech Education",
    depts: ["Educational Technology", "Library & Information Tech", "Science Education"]
  }
};

// 1. CONTENT COMPONENT (Contains the search params logic)
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const [step, setStep] = useState(1);
  const [customDept, setCustomDept] = useState('');
  
  const [formData, setFormData] = useState({
    faculty: '',
    department: '',
    level: '',
    interests: [] as string[],
    full_name: searchParams.get('name') || '',  
    email: searchParams.get('email') || ''      
  });

  const handleDeptSelect = (dept: string) => {
    if (dept === 'Other') {
      setFormData({ ...formData, department: 'Other' });
    } else {
      setFormData({ ...formData, department: dept });
      setCustomDept(''); 
    }
  };

  const handleFinish = async () => {
    const finalDept = formData.department === 'Other' ? customDept : formData.department;
    
    const profileData = {
      faculty: formData.faculty,
      department: finalDept,
      level: formData.level,
      interests: formData.interests,
      full_name: formData.full_name, 
      email: formData.email,         
      matric_number: `STU-${Math.floor(Math.random() * 10000)}` 
    };

    try {
      const { error } = await supabase.from('student_profiles').insert([profileData]);
      if (error) throw error;

      localStorage.setItem('tacsfonStudent', JSON.stringify(profileData));

      alert("Profile Created Successfully!");
      router.push('/'); 
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // @ts-ignore
  const currentDepts = formData.faculty ? [...FACULTIES[formData.faculty].depts, "Other"] : [];

  return (
    <div className="max-w-3xl w-full">
        {/* NEON PROGRESS BAR */}
        <div className="flex items-center justify-between mb-12 px-4">
            {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 border-2 ${step >= num ? 'border-tacsfon-neonGreen bg-tacsfon-neonGreen text-black shadow-[0_0_15px_#00FF88]' : 'border-gray-700 bg-gray-800 text-gray-500'}`}>
                        {num}
                    </div>
                    {num < 4 && <div className={`w-12 h-1 rounded-full transition-all duration-500 ${step > num ? 'bg-tacsfon-neonGreen shadow-[0_0_10px_#00FF88]' : 'bg-gray-800'}`}></div>}
                </div>
            ))}
        </div>

        {/* STEP 1: FACULTY */}
        {step === 1 && (
            <div className="animate-fade-in space-y-8">
                <div className="text-center">
                    <School size={56} className="mx-auto text-tacsfon-neonOrange mb-4 drop-shadow-[0_0_10px_#FFAA00]" />
                    <h1 className="text-3xl font-bold text-white">Select your School (Faculty)</h1>
                    <p className="text-gray-400">This helps us narrow down your department.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(FACULTIES).map(([key, data]) => (
                        <button 
                            key={key}
                            // @ts-ignore
                            onClick={() => setFormData({...formData, faculty: key, department: ''})}
                            className={`p-5 rounded-xl border text-left transition-all duration-300 group hover:scale-[1.02] ${formData.faculty === key ? 'border-tacsfon-neonGreen bg-tacsfon-neonGreen/10 text-tacsfon-neonGreen shadow-[0_0_20px_rgba(0,255,136,0.2)]' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'}`}
                        >
                            <span className="font-bold text-lg block mb-1">{key}</span>
                            {/* @ts-ignore */}
                            <span className="text-sm opacity-80 font-light">{data.name}</span>
                        </button>
                    ))}
                </div>
                <div className="flex justify-end mt-8">
                    <button onClick={() => formData.faculty && setStep(2)} disabled={!formData.faculty} className="px-8 py-3 bg-tacsfon-neonGreen text-black font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_#00FF88] transition-all flex items-center gap-2">
                        Next Step <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: DEPARTMENT */}
        {step === 2 && (
            <div className="animate-fade-in space-y-8">
                <div className="text-center">
                    <School size={56} className="mx-auto text-tacsfon-neonOrange mb-4 drop-shadow-[0_0_10px_#FFAA00]" />
                    <h1 className="text-3xl font-bold text-white">Select Department</h1>
                    <p className="text-gray-400">Departments under <span className="text-tacsfon-neonGreen">{formData.faculty}</span></p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {currentDepts.map((dept: any) => (
                        <button 
                            key={dept}
                            onClick={() => handleDeptSelect(dept)}
                            className={`p-4 rounded-xl border text-sm font-bold transition-all text-left ${formData.department === dept ? 'border-tacsfon-neonGreen bg-tacsfon-neonGreen/10 text-tacsfon-neonGreen shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>

                {formData.department === 'Other' && (
                    <div className="animate-fade-in">
                        <label className="text-sm font-bold text-tacsfon-neonOrange mb-2 block">Enter your Department Name</label>
                        <div className="relative">
                            <Edit3 className="absolute left-4 top-3.5 text-gray-500" size={20} />
                            <input 
                                type="text"
                                value={customDept}
                                onChange={(e) => setCustomDept(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-tacsfon-neonOrange text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g. Artificial Intelligence"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-600 text-gray-400 font-bold rounded-xl hover:bg-gray-800">Back</button>
                    <button 
                        onClick={() => (formData.department !== 'Other' || customDept.length > 2) && setStep(3)} 
                        disabled={!formData.department || (formData.department === 'Other' && customDept.length < 3)} 
                        className="px-8 py-3 bg-tacsfon-neonGreen text-black font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_#00FF88] transition-all flex items-center gap-2"
                    >
                        Next Step <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* STEP 3: LEVEL */}
        {step === 3 && (
            <div className="animate-fade-in text-center space-y-8">
                <GraduationCap size={56} className="mx-auto text-tacsfon-neonOrange mb-4 drop-shadow-[0_0_10px_#FFAA00]" />
                <h1 className="text-3xl font-bold text-white">Current Level</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'].map(lvl => (
                        <button 
                            key={lvl}
                            onClick={() => setFormData({...formData, level: lvl})}
                            className={`p-6 rounded-xl border-2 text-lg font-bold transition-all ${formData.level === lvl ? 'border-tacsfon-neonGreen bg-tacsfon-neonGreen/20 text-tacsfon-neonGreen shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'}`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(2)} className="px-6 py-3 border border-gray-600 text-gray-400 font-bold rounded-xl hover:bg-gray-800">Back</button>
                    <button onClick={() => formData.level && setStep(4)} disabled={!formData.level} className="px-8 py-3 bg-tacsfon-neonGreen text-black font-bold rounded-xl disabled:opacity-30 hover:shadow-[0_0_20px_#00FF88] transition-all flex items-center gap-2">
                        Next Step <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* STEP 4: INTERESTS */}
        {step === 4 && (
            <div className="animate-fade-in text-center space-y-8">
                <Book size={56} className="mx-auto text-tacsfon-neonOrange mb-4 drop-shadow-[0_0_10px_#FFAA00]" />
                <h1 className="text-3xl font-bold text-white">Your Interests</h1>
                <p className="text-gray-400">Select what you love reading.</p>
                
                <div className="grid grid-cols-2 gap-4">
                    {['Spiritual Growth', 'Academic Excellence', 'Technology', 'Leadership', 'Fiction/Novels', 'History', 'Finance', 'Health'].map(interest => (
                        <button 
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`p-4 rounded-xl border-2 text-sm font-bold flex items-center justify-between transition-all ${formData.interests.includes(interest) ? 'border-tacsfon-neonOrange bg-tacsfon-neonOrange/20 text-tacsfon-neonOrange shadow-[0_0_15px_rgba(255,170,0,0.3)]' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'}`}
                        >
                            {interest}
                            {formData.interests.includes(interest) && <CheckCircle size={16} />}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(3)} className="px-6 py-3 border border-gray-600 text-gray-400 font-bold rounded-xl hover:bg-gray-800">Back</button>
                    <button onClick={handleFinish} className="px-10 py-3 bg-gradient-to-r from-tacsfon-neonGreen to-tacsfon-neonOrange text-black font-bold rounded-xl shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:shadow-[0_0_50px_rgba(0,255,136,0.6)] hover:scale-105 transition-all">
                        Complete Setup
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}

// 2. MAIN EXPORT (Wraps the content in Suspense)
export default function StudentOnboarding() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-white">
      {/* This Suspense boundary is REQUIRED by Next.js for any component 
         that uses useSearchParams(). It tells the build server: 
         "Wait to render this part until the browser is ready."
      */}
      <Suspense fallback={<div className="text-white text-center">Loading onboarding...</div>}>
        <OnboardingContent />
      </Suspense>
    </main>
  );
}