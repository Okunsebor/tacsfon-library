export default function FuturisticLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      
      {/* THE ANIMATION CONTAINER */}
      <div className="relative w-24 h-24">
        
        {/* Ring 1: Outer Green Orbit (Slow & Reverse) */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-tacsfon-green border-r-tacsfon-green/30 animate-[spin_3s_linear_infinite_reverse] shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
        
        {/* Ring 2: Inner Orange Reactor (Fast & Forward) */}
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-orange-500 border-l-orange-500/50 animate-[spin_1.5s_linear_infinite] shadow-[0_0_20px_rgba(249,115,22,0.6)]"></div>
        
        {/* Core: The Pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>

      </div>

      {/* TEXT: Typing Effect */}
      <div className="flex flex-col items-center">
        <span className="text-gray-400 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
            ACCESSING
        </span>
      </div>

    </div>
  );
}