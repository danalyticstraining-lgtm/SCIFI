import React from 'react';
import { Sparkles } from 'lucide-react';

interface DisplayProps {
  value: string;
  expression: string;
  isAiMode: boolean;
  explanation?: string;
}

const Display: React.FC<DisplayProps> = ({ value, expression, isAiMode, explanation }) => {
  return (
    <div className="w-full bg-gray-850 p-6 rounded-3xl mb-4 shadow-inner flex flex-col justify-end min-h-[160px] relative overflow-hidden transition-colors duration-500 border border-gray-700">
      
      {/* Background decoration for AI mode */}
      {isAiMode && (
        <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
          <Sparkles className="w-24 h-24 text-purple-500 animate-pulse" />
        </div>
      )}

      {/* History / Expression */}
      <div className="text-right text-gray-400 text-lg mb-1 h-6 font-medium truncate">
        {expression}
      </div>

      {/* Main Display Value */}
      <div 
        className={`text-right font-bold tracking-tight break-all transition-all duration-300 ${
          value.length > 10 ? 'text-4xl' : 'text-6xl'
        } ${isAiMode ? 'text-purple-200' : 'text-white'}`}
      >
        {value}
      </div>

      {/* AI Explanation Text */}
      {isAiMode && explanation && (
        <div className="mt-2 text-right text-xs text-purple-300 font-medium animate-fade-in border-t border-purple-500/20 pt-2">
          {explanation}
        </div>
      )}
    </div>
  );
};

export default Display;