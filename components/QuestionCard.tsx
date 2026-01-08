
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { getAIExplanation } from '../geminiService';

interface QuestionCardProps {
  question: Question;
  onAnswer: (correct: boolean) => void;
  isMockTest?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isMockTest }) => {
  // Guard against undefined question to prevent 'id' access error
  if (!question) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-12 max-w-2xl mx-auto text-center border border-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-medium">Preparing question...</p>
      </div>
    );
  }

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExp, setAiExp] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Reset local state when the question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowExplanation(false);
    setAiExp('');
  }, [question.id]);

  const handleOptionClick = (index: number) => {
    // Prevent changing answer in practice mode after selection
    if (selectedOption !== null && !isMockTest) return;
    
    setSelectedOption(index);
    const isCorrect = index === question.correctAnswerIndex;
    
    if (isMockTest) {
      onAnswer(isCorrect);
    } else {
      setShowExplanation(true);
      onAnswer(isCorrect);
    }
  };

  const askAI = async () => {
    if (selectedOption === null || loadingAi) return;
    setLoadingAi(true);
    try {
      const exp = await getAIExplanation(
        question.question, 
        question.options[selectedOption], 
        question.options[question.correctAnswerIndex]
      );
      setAiExp(exp);
    } catch (err) {
      setAiExp("The AI service is temporarily unavailable. Please try again in a moment.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto border border-gray-100 transition-all duration-300">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-blue-100">
            {question.category}
          </span>
          {!isMockTest && selectedOption !== null && (
             <span className={`text-xs font-black px-2 py-1 rounded-md uppercase tracking-tight ${selectedOption === question.correctAnswerIndex ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {selectedOption === question.correctAnswerIndex ? 'Correct Answer' : 'Incorrect Answer'}
             </span>
          )}
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
          {question.question}
        </h2>
      </div>

      {question.imageUrl && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-inner p-2">
          <img 
            src={question.imageUrl} 
            alt="Road scenario" 
            className="w-full h-auto max-h-64 object-contain rounded-xl mx-auto"
          />
        </div>
      )}

      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => {
          let variant = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm";
          let animationClass = "";
          let icon = null;
          
          const isUserSelection = selectedOption === idx;
          const isCorrectAnswer = idx === question.correctAnswerIndex;

          if (selectedOption !== null && !isMockTest) {
            if (isCorrectAnswer) {
              variant = "bg-green-50 border-green-500 text-green-800 font-semibold ring-4 ring-green-100 shadow-[0_0_20px_rgba(34,197,94,0.15)]";
              icon = (
                <div className="bg-green-500 text-white rounded-full p-0.5 animate-bounce-in">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
              );
              if (isUserSelection) animationClass = "animate-select-pop";
            } else if (isUserSelection) {
              variant = "bg-red-50 border-red-500 text-red-800 ring-4 ring-red-100 shadow-[0_0_20px_rgba(239,68,68,0.15)]";
              animationClass = "animate-select-pop";
              icon = (
                <div className="bg-red-500 text-white rounded-full p-0.5 animate-shake">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
              );
            }
          } else if (selectedOption === idx) {
            // Standard selection visual (before explanation shown or in Mock Test)
            variant = "bg-blue-600 border-blue-600 text-white font-semibold shadow-lg ring-4 ring-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.3)]";
            animationClass = "animate-select-pop";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              className={`w-full p-4 text-left border-2 rounded-2xl transition-all duration-200 flex items-center gap-4 relative overflow-hidden group ${variant} ${animationClass}`}
              disabled={selectedOption !== null && !isMockTest}
            >
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border text-sm font-black transition-colors ${selectedOption === idx ? 'bg-white text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1 text-sm md:text-base leading-tight">{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {showExplanation && !isMockTest && (
        <div className="mt-8 pt-8 border-t border-slate-100 animate-fadeIn space-y-5">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-xs uppercase tracking-widest">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Quick Explanation
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">{question.explanation}</p>
          </div>

          {!aiExp ? (
            <button 
              onClick={askAI}
              disabled={loadingAi}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loadingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Consulting Driving Expert AI...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.243 14.243a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6.464 14.243a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" /></svg>
                  <span className="text-sm">Ask AI for Detailed Breakdown</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl text-white shadow-2xl animate-slideUp relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.243 14.243a1 1 0 101.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6.464 14.243a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" /></svg>
               </div>
               <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2 opacity-80">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                AI Expert Analysis
              </h4>
              <p className="text-sm italic leading-relaxed relative z-10 font-medium">"{aiExp}"</p>
              <div className="mt-4 pt-3 border-t border-white/10 text-[9px] uppercase tracking-widest font-bold opacity-60">
                Generated by Gemini 3 Flash
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
