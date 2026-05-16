'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import { Brain, CheckCircle2, ChevronRight, AlertCircle, BookOpen } from 'lucide-react';

const AVAILABLE_COURSES = [
  "English", "Mathematics", "Physics", "Chemistry", 
  "Biology", "Economics", "Government", "Literature", 
  "CRK", "Accounting", "Commerce", "Geography"
];

export default function LearningHubHome() {
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const toggleCourse = (course: string) => {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(prev => prev.filter(c => c !== course));
    } else {
      if (selectedCourses.length >= 4) {
        alert("You can only select a maximum of 4 courses per session.");
        return;
      }
      setSelectedCourses(prev => [...prev, course]);
    }
  };

  const handleStartSession = () => {
    if (selectedCourses.length === 0) {
      alert("Please select at least one course to start.");
      return;
    }
    const coursesQuery = encodeURIComponent(selectedCourses.join(','));
    router.push(`/learning-hub/session?courses=${coursesQuery}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-24 md:py-32">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-tacsfon-green text-white p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-tacsfon-green/80 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Brain size={28} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Learning Hub</h1>
            </div>
            <p className="text-white/80 max-w-xl text-lg relative z-10">
              Select up to 4 courses to start your practice session. Prepare effectively with our CBT simulator.
            </p>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="text-tacsfon-green" size={20} /> Available Courses
              </h2>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedCourses.length === 4 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                {selectedCourses.length} / 4 Selected
              </span>
            </div>

            {selectedCourses.length === 4 && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3 text-orange-700">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">You have reached the maximum limit of 4 courses. Deselect a course to choose another.</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
              {AVAILABLE_COURSES.map(course => {
                const isSelected = selectedCourses.includes(course);
                return (
                  <button
                    key={course}
                    onClick={() => toggleCourse(course)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[100px] ${
                      isSelected 
                        ? 'bg-green-50 border-tacsfon-green shadow-[0_4px_12px_rgba(0,104,56,0.15)] ring-2 ring-tacsfon-green/20' 
                        : 'bg-white border-gray-200 hover:border-tacsfon-green/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full mb-2">
                      <span className={`font-bold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                        {course}
                      </span>
                      {isSelected && <CheckCircle2 size={20} className="text-tacsfon-green shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                onClick={handleStartSession}
                disabled={selectedCourses.length === 0}
                className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg ${
                  selectedCourses.length > 0
                    ? 'bg-tacsfon-orange text-white hover:bg-orange-600 hover:shadow-orange-600/30 hover:-translate-y-1'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Start Session <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
