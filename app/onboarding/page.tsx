'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, GraduationCap, Heart, User } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form States
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const faculties = [
    "School of Agriculture & Agricultural Technology",
    "School of Engineering & Engineering Technology",
    "School of Environmental Technology",
    "School of Information & Communication Technology",
    "School of Life Sciences",
    "School of Physical Sciences",
    "School of Science & Technology Education"
  ];

  const interestOptions = [
    "Spiritual Growth", "Leadership", "Technology", "Music & Arts", 
    "Career Development", "Relationships", "Academic Excellence", 
    "Evangelism", "Finance & Business"
  ];

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/student-login');
        return;
      }
      setUser(session.user);
    }
    getUser();
  }, [router]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleComplete = async () => {
    if (!faculty || !department || !level) {
      alert("Please fill in your academic details.");
      return;
    }
    setLoading(true);

    // --- KEY CHANGE HERE: USE UPSERT INSTEAD OF UPDATE ---
    // This creates the row if it's a new user, or updates it if they exist.
    const { error } = await supabase
      .from('student_profiles')
      .upsert({
        email: user.email, // Required to match the row
        full_name: user.user_metadata?.full_name || 'Student', // Fallback name
        faculty,
        department,
        level,
        interests: selectedInterests,
        profile_completed: true
      }, { onConflict: 'email' }); // Matches based on email

    if (error) {
      alert("Error saving profile: " + error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Visual */}
        <div className="bg-gray-900 text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-tacsfon-green opacity-10" />
           <div className="relative z-10">
               <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
                   <User className="text-tacsfon-neonGreen" />
               </div>
               <h2 className="text-3xl font-extrabold mb-2">Welcome Home.</h2>
               <p className="text-gray-400 text-sm">Let's customize your library experience to help you grow.</p>
           </div>
           
           <div className="relative z-10 mt-10 space-y-2">
               <div className={`flex items-center gap-3 text-sm ${faculty ? 'text-tacsfon-neonGreen' : 'text-gray-600'}`}>
                   <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${faculty ? 'bg-tacsfon-neonGreen border-tacsfon-neonGreen text-black' : 'border-gray-600'}`}>1</div>
                   <span>Academics</span>
               </div>
               <div className={`flex items-center gap-3 text-sm ${selectedInterests.length > 0 ? 'text-tacsfon-neonGreen' : 'text-gray-600'}`}>
                   <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selectedInterests.length > 0 ? 'bg-tacsfon-neonGreen border-tacsfon-neonGreen text-black' : 'border-gray-600'}`}>2</div>
                   <span>Interests</span>
               </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:w-2/3">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap className="text-tacsfon-orange"/> Academic Profile
            </h3>

            <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Faculty / School</label>
                    <select 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                    >
                        <option value="">Select Faculty...</option>
                        {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Computer Science"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label>
                        <select 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-tacsfon-green"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                        >
                            <option value="">Level...</option>
                            <option value="100">100 Level</option>
                            <option value="200">200 Level</option>
                            <option value="300">300 Level</option>
                            <option value="400">400 Level</option>
                            <option value="500">500 Level</option>
                        </select>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="text-red-500"/> Your Interests
            </h3>
            <div className="flex flex-wrap gap-2 mb-8">
                {interestOptions.map(interest => (
                    <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            selectedInterests.includes(interest) 
                            ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        {interest}
                    </button>
                ))}
            </div>

            <button 
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-tacsfon-green text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <>Complete Setup <ChevronRight size={20}/></>}
            </button>

        </div>
      </div>
    </div>
  );
}