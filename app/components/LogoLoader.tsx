export default function LogoLoader() {
  return (
    <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center space-y-6 shadow-2xl border border-cyan-500/30 relative overflow-hidden">
      {/* Spinning Ring */}
      <div className="relative w-24 h-24 flex items-center justify-center">
         <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
         
         {/* Center Logo */}
         <img 
          src="/logo.png" 
          alt="Loading" 
          className="w-12 h-12 object-contain animate-pulse"
        />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-bold text-white tracking-widest">TACSFON<span className="text-cyan-400">Lib</span></h3>
        <p className="text-cyan-200/60 text-xs uppercase tracking-[0.2em] mt-2 animate-pulse">Initializing Knowledge Matrix...</p>
      </div>
    </div>
  );
}