'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, Calculator, Bookmark, AlertTriangle, Clock, Volume2, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// --- TYPES ---
interface Question {
  id: number;
  text: string;
  image?: string;
  options: { id: string; text: string }[];
}

interface CourseData {
  name: string;
  questions: Question[];
}

// --- MOCK DATA GENERATOR ---
// Generates 50 dummy questions per course for the UI
const generateMockQuestions = (): Question[] => {
  return Array.from({ length: 50 }).map((_, idx) => ({
    id: idx + 1,
    text: `Sample question ${idx + 1} for this subject. This is a placeholder text to demonstrate the layout. What is the correct answer?`,
    // Randomly assign an image to some questions to show UI capability
    image: idx === 7 ? 'https://images.unsplash.com/photo-1632516643738-1a520cb2ce2e?q=80&w=400&auto=format&fit=crop' : undefined,
    options: [
      { id: 'A', text: `Option A for question ${idx + 1}` },
      { id: 'B', text: `Option B for question ${idx + 1}` },
      { id: 'C', text: `Option C for question ${idx + 1}` },
      { id: 'D', text: `Option D for question ${idx + 1}` },
    ]
  }));
};

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [activeCourseIdx, setActiveCourseIdx] = useState(0);
  
  // Track current question per course: { courseName: currentQuestionIndex }
  const [currentQuestions, setCurrentQuestions] = useState<Record<string, number>>({});
  
  // Track answers: { courseName: { questionId: selectedOptionId } }
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds

  useEffect(() => {
    const courseParam = searchParams.get('courses');
    if (!courseParam) {
      router.replace('/learning-hub');
      return;
    }
    
    const courseNames = courseParam.split(',');
    const initialData: CourseData[] = courseNames.map(name => ({
      name,
      questions: generateMockQuestions()
    }));
    
    setCourses(initialData);

    // Initialize current question tracking and answers tracking
    const initialQs: Record<string, number> = {};
    const initialAns: Record<string, Record<number, string>> = {};
    
    courseNames.forEach(name => {
      initialQs[name] = 0;
      initialAns[name] = {};
    });
    
    setCurrentQuestions(initialQs);
    setAnswers(initialAns);

  }, [searchParams, router]);

  // Timer Countdown
  useEffect(() => {
    if (courses.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [courses]);

  if (courses.length === 0) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading Session...</div>;

  const activeCourse = courses[activeCourseIdx];
  const qIdx = currentQuestions[activeCourse.name];
  const currentQ = activeCourse.questions[qIdx];
  const courseAnswers = answers[activeCourse.name] || {};
  const attemptedCount = Object.keys(courseAnswers).length;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [activeCourse.name]: {
        ...prev[activeCourse.name],
        [currentQ.id]: optionId
      }
    }));
  };

  const goToQuestion = (idx: number) => {
    setCurrentQuestions(prev => ({
      ...prev,
      [activeCourse.name]: idx
    }));
  };

  const handleNext = () => {
    if (qIdx < activeCourse.questions.length - 1) {
      goToQuestion(qIdx + 1);
    }
  };

  const handlePrev = () => {
    if (qIdx > 0) {
      goToQuestion(qIdx - 1);
    }
  };

  const handleFinalSubmit = () => {
    if (confirm("Are you sure you want to submit your test?")) {
      alert("Test submitted successfully! (Mock Action)");
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-sans">
      
      {/* --- TOP BAR --- */}
      <header className="bg-tacsfon-dark text-white flex items-center justify-between shadow-md relative z-20">
        <div className="flex items-center">
          <button onClick={() => router.push('/learning-hub')} className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-sm border-r border-white/10">
            <LogOut size={16} /> Log out
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-sm border-r border-white/10">
            <Calculator size={16} /> Calculator
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-sm border-r border-white/10">
            <Bookmark size={16} /> Bookmark
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-sm border-r border-white/10">
            <AlertTriangle size={16} /> Report Error
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 hidden md:flex">
             <div className="w-6 h-6 bg-tacsfon-orange rounded-full flex items-center justify-center">
               <span className="text-xs font-bold text-white">JD</span>
             </div>
             <span className="text-sm font-bold uppercase tracking-wider">John Doe</span>
          </div>
          
          <button onClick={handleFinalSubmit} className="bg-tacsfon-orange hover:bg-orange-600 text-white px-6 py-3 font-bold text-sm flex items-center gap-2 transition-colors rounded-lg shadow-lg hover:shadow-orange-600/30">
            <CheckCircle2 size={16} /> Submit Test
          </button>
          
          <div className="bg-tacsfon-green text-white px-6 py-3 font-bold flex items-center gap-2 tracking-widest rounded-lg">
            <Clock size={18} /> {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* --- TABS --- */}
      <div className="bg-gray-100 border-b-2 border-gray-300 flex overflow-x-auto scrollbar-hide">
        {courses.map((course, idx) => (
          <button
            key={course.name}
            onClick={() => setActiveCourseIdx(idx)}
            className={`px-8 py-3 text-sm font-bold transition-all whitespace-nowrap border-r border-gray-300 ${
              activeCourseIdx === idx 
                ? 'bg-tacsfon-green text-white rounded-t-lg shadow-[inset_0_3px_0_rgba(0,0,0,0.2)] relative z-10 -mx-1' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {course.name}
          </button>
        ))}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Question Area */}
        <div className="flex-1 bg-white shadow-sm border border-gray-200 rounded-xl flex flex-col">
          
          {/* Question Header */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-gray-800 text-lg">
              <ChevronRight size={20} className="text-gray-400" />
              Question {currentQ.id}/{activeCourse.questions.length}
            </div>
            <button title="Read question aloud" className="text-gray-400 hover:text-tacsfon-green transition-colors">
               <Volume2 size={24} />
            </button>
          </div>

          {/* Question Body */}
          <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            {currentQ.image && (
              <div className="mb-6 relative w-full max-w-lg h-48 md:h-64 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                 <Image src={currentQ.image} alt="Question Diagram" fill className="object-contain" unoptimized />
              </div>
            )}
            
            <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed mb-8">
              {currentQ.text}
            </p>

            <div className="space-y-3">
              {currentQ.options.map(opt => {
                const isSelected = courseAnswers[currentQ.id] === opt.id;
                return (
                  <label 
                    key={opt.id} 
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected 
                        ? 'border-tacsfon-orange bg-orange-50/50' 
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-gray-500 w-6">{opt.id}</div>
                    
                    {/* Custom Radio Button mimicking the CBT look */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-tacsfon-orange' : 'border-gray-400'}`}>
                       {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-tacsfon-orange" />}
                    </div>

                    <span className="text-gray-700 md:text-lg select-none">{opt.text}</span>
                    
                    {/* Hidden actual radio for accessibility */}
                    <input 
                      type="radio" 
                      name={`q-${currentQ.id}`} 
                      className="hidden" 
                      checked={isSelected}
                      onChange={() => handleOptionSelect(opt.id)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200 flex items-center gap-4 rounded-b-xl">
            <button 
              onClick={handlePrev}
              disabled={qIdx === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-bold text-white transition-all ${
                qIdx === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#48bb78] hover:bg-green-600'
              }`}
            >
              <ArrowLeft size={18} /> Previous
            </button>
            <button 
              onClick={handleNext}
              disabled={qIdx === activeCourse.questions.length - 1}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-md font-bold text-white transition-all ${
                qIdx === activeCourse.questions.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-tacsfon-orange hover:bg-orange-600'
              }`}
            >
              Next <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Side / Bottom: Question Grid Tracker */}
        <div className="w-full md:w-80 bg-white shadow-sm border border-gray-200 rounded-xl flex flex-col overflow-hidden h-fit">
           <div className="bg-tacsfon-green text-white px-4 py-3 font-bold flex justify-between items-center text-sm">
             <span>Attempted {attemptedCount}/{activeCourse.questions.length}</span>
           </div>
           <div className="p-4 grid grid-cols-5 md:grid-cols-5 gap-2 max-h-[300px] md:max-h-full overflow-y-auto">
             {activeCourse.questions.map((q, idx) => {
               const isAttempted = !!courseAnswers[q.id];
               const isCurrent = qIdx === idx;
               
               let btnClass = "border border-gray-300 bg-white text-gray-700"; // default
               
               if (isCurrent) {
                 btnClass = "border-tacsfon-orange bg-orange-50 text-orange-700 font-extrabold ring-2 ring-orange-200";
               } else if (isAttempted) {
                 btnClass = "border-tacsfon-green bg-green-50 text-green-700 font-bold";
               }

               return (
                 <button
                   key={q.id}
                   onClick={() => goToQuestion(idx)}
                   className={`h-10 rounded-md text-sm transition-all hover:bg-gray-100 ${btnClass}`}
                 >
                   {q.id}
                 </button>
               );
             })}
           </div>
        </div>

      </main>

    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading Session Environment...</div>}>
      <SessionContent />
    </Suspense>
  );
}
