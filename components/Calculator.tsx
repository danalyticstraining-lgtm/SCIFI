import React, { useState, useEffect, useCallback } from 'react';
import { Calculator as CalcIcon, Sparkles, Delete, RotateCcw, History } from 'lucide-react';
import Button from './Button';
import Display from './Display';
import { ButtonVariant, HistoryItem } from '../types';
import { calculateWithGemini } from '../services/geminiService';

const Calculator: React.FC = () => {
  // Calculator State
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [expression, setExpression] = useState('');
  
  // AI Mode State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  
  // History State
  const [aiHistory, setAiHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // --- Standard Calculator Logic ---

  const inputDigit = (digit: string) => {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
    setExpression('');
    setExplanation('');
    setAiInput('');
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operator) {
      const currentValue = previousValue || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, operator);
      
      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
    setExpression(`${display} ${nextOperator}`);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '×': return first * second;
      case '÷': return first / second;
      default: return second;
    }
  };

  const handleEqual = () => {
    if (!operator || previousValue === null) return;

    const inputValue = parseFloat(display);
    const result = calculate(parseFloat(previousValue), inputValue, operator);
    
    setExpression(`${previousValue} ${operator} ${display} =`);
    setDisplay(String(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const handlePercentage = () => {
    const currentValue = parseFloat(display);
    if (currentValue === 0) return;
    const fixed = (currentValue / 100).toString();
    setDisplay(fixed);
  };

  const handleSignToggle = () => {
    const currentValue = parseFloat(display);
    if (currentValue === 0) return;
    setDisplay((currentValue * -1).toString());
  };

  // --- AI Logic ---

  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;
    
    setAiLoading(true);
    setExpression(aiInput);
    setShowHistory(false); // Ensure we see the result
    
    try {
      const { result, explanation: aiExplanation } = await calculateWithGemini(aiInput);
      setDisplay(result);
      setExplanation(aiExplanation);

      // Add to history
      setAiHistory(prev => [{
        expression: aiInput,
        result: result,
        explanation: aiExplanation
      }, ...prev]);

    } catch (error) {
      setDisplay("Error");
      setExplanation("Could not reach AI service.");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleAiMode = () => {
    setIsAiMode(!isAiMode);
    clear();
    setShowHistory(false);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setAiInput(item.expression);
    setExpression(item.expression);
    setDisplay(item.result);
    setExplanation(item.explanation || '');
    setShowHistory(false);
  };

  // Keyboard support for standard calc
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAiMode) return; // Disable keyboard shortcuts in AI mode to allow typing

      const { key } = event;
      
      if (/[0-9]/.test(key)) inputDigit(key);
      if (key === '.') inputDecimal();
      if (key === '=' || key === 'Enter') {
        event.preventDefault();
        handleEqual();
      }
      if (key === 'Backspace') {
        setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
      }
      if (key === 'Escape') clear();
      if (key === '+') performOperation('+');
      if (key === '-') performOperation('-');
      if (key === '*') performOperation('×');
      if (key === '/') {
        event.preventDefault(); 
        performOperation('÷');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, previousValue, operator, waitingForNewValue, isAiMode]);

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-900 rounded-[2.5rem] p-6 shadow-2xl border-4 border-gray-800">
      
      {/* Header / Mode Switcher */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
          {isAiMode ? 'Gemini Mode' : 'Standard'}
        </h1>
        <button 
          onClick={toggleAiMode}
          className={`p-2 rounded-full transition-all duration-300 ${isAiMode ? 'bg-purple-600/20 text-purple-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          title="Toggle AI Mode"
        >
          {isAiMode ? <Sparkles size={20} /> : <CalcIcon size={20} />}
        </button>
      </div>

      {/* AI Input Field Overlay */}
      {isAiMode ? (
        <div className="mb-4">
           <Display 
            value={display} 
            expression={expression} 
            isAiMode={true} 
            explanation={explanation}
          />
          
          <div className="relative min-h-[128px]">
            {showHistory ? (
              <div className="h-32 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden flex flex-col">
                 <div className="px-4 py-2 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-800/50 backdrop-blur">
                   History
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
                    {aiHistory.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
                        No history yet
                      </div>
                    ) : (
                      aiHistory.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => loadHistoryItem(item)}
                          className="bg-gray-700/30 hover:bg-gray-700/60 p-3 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors">
                            {item.expression}
                          </div>
                          <div className="text-purple-300 font-medium text-sm mt-1">
                            = {item.result}
                          </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full h-32 bg-gray-800 text-white p-4 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700 placeholder-gray-500 text-lg"
                  placeholder="Ask anything... e.g., 'Square root of 144 plus 50'"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  disabled={aiLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleAiSubmit}
                  disabled={!aiInput.trim() || aiLoading}
                  className={`absolute bottom-3 right-3 p-2 rounded-xl transition-all ${
                    aiLoading ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-500'
                  } text-white shadow-lg`}
                >
                  {aiLoading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={20} />}
                </button>
              </>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
             <Button 
               label={<History size={20} />} 
               onClick={() => setShowHistory(!showHistory)} 
               variant={showHistory ? ButtonVariant.FEATURE : ButtonVariant.ACTION} 
               className={showHistory ? "ring-2 ring-purple-500/50" : ""}
             />
             <Button label="Clear" onClick={clear} variant={ButtonVariant.ACTION} className="bg-gray-700 text-white" />
             <Button label="Exit" onClick={toggleAiMode} variant={ButtonVariant.DEFAULT} />
          </div>
        </div>
      ) : (
        /* Standard Keypad */
        <>
          <Display 
            value={display} 
            expression={expression} 
            isAiMode={false} 
          />
          
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <Button label="AC" onClick={clear} variant={ButtonVariant.ACTION} />
            <Button label="+/-" onClick={handleSignToggle} variant={ButtonVariant.ACTION} />
            <Button label="%" onClick={handlePercentage} variant={ButtonVariant.ACTION} />
            <Button label="÷" onClick={() => performOperation('÷')} variant={ButtonVariant.OPERATOR} />

            {/* Row 2 */}
            <Button label="7" onClick={() => inputDigit('7')} />
            <Button label="8" onClick={() => inputDigit('8')} />
            <Button label="9" onClick={() => inputDigit('9')} />
            <Button label="×" onClick={() => performOperation('×')} variant={ButtonVariant.OPERATOR} />

            {/* Row 3 */}
            <Button label="4" onClick={() => inputDigit('4')} />
            <Button label="5" onClick={() => inputDigit('5')} />
            <Button label="6" onClick={() => inputDigit('6')} />
            <Button label="-" onClick={() => performOperation('-')} variant={ButtonVariant.OPERATOR} />

            {/* Row 4 */}
            <Button label="1" onClick={() => inputDigit('1')} />
            <Button label="2" onClick={() => inputDigit('2')} />
            <Button label="3" onClick={() => inputDigit('3')} />
            <Button label="+" onClick={() => performOperation('+')} variant={ButtonVariant.OPERATOR} />

            {/* Row 5 */}
            <Button label="0" onClick={() => inputDigit('0')} className="col-span-2 pl-6 !justify-start" />
            <Button label="." onClick={inputDecimal} />
            <Button label="=" onClick={handleEqual} variant={ButtonVariant.OPERATOR} className="bg-indigo-600 hover:bg-indigo-500" />
          </div>
        </>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-gray-600 font-medium tracking-wide uppercase">
        {isAiMode ? 'Powered by Gemini 2.5 Flash' : 'Simple Mode'}
      </div>
    </div>
  );
};

export default Calculator;