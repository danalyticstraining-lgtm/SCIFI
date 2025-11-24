import React from 'react';
import Calculator from './components/Calculator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
       {/* Ambient background glow */}
       <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />
       
      <div className="relative w-full max-w-md">
        <Calculator />
      </div>
    </div>
  );
};

export default App;