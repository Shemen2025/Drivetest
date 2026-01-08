
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { AppMode, Question, TestResult, Category } from './types';
import { QUESTIONS, CATEGORIES } from './constants';
import { getStudyTip } from './geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTip, setActiveTip] = useState<string>('');
  const [loadingTip, setLoadingTip] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // PWA Install Logic
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Load results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('drive_test_results');
    if (saved) {
      try {
        setTestResults(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const saveResult = (newResult: TestResult) => {
    const updated = [newResult, ...testResults];
    setTestResults(updated);
    localStorage.setItem('drive_test_results', JSON.stringify(updated));
  };

  const startPractice = (category?: Category) => {
    let filtered = category 
      ? QUESTIONS.filter(q => q.category === category)
      : [...QUESTIONS].sort(() => Math.random() - 0.5);
    
    if (filtered.length === 0) filtered = [QUESTIONS[0]];
    
    setCurrentQuestions(filtered);
    setQuestionIndex(0);
    setScore(0);
    setMode(AppMode.PRACTICE);
    window.scrollTo(0, 0);
  };

  const startMockTest = () => {
    const mockSet = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5); // Keep short for demo, set to 50 for production
    setCurrentQuestions(mockSet);
    setQuestionIndex(0);
    setScore(0);
    setTimeLeft(57 * 60); 
    setMode(AppMode.MOCK_TEST);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    let timer: any;
    if (mode === AppMode.MOCK_TEST && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && mode === AppMode.MOCK_TEST) {
      finishTest();
    }
    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  const finishTest = () => {
    const passed = score >= (currentQuestions.length * 0.86); // Proportional to 43/50
    const result: TestResult = {
      date: new Date().toLocaleDateString(),
      score,
      total: currentQuestions.length,
      passed,
      timeTaken: (57 * 60) - timeLeft
    };
    saveResult(result);
    setMode(AppMode.REVIEW);
    window.scrollTo(0, 0);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    if (questionIndex < currentQuestions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      if (mode === AppMode.MOCK_TEST) {
        finishTest();
      } else {
        setMode(AppMode.HOME);
        window.scrollTo(0, 0);
      }
    }
  };

  const fetchTip = async (category: string) => {
    setLoadingTip(true);
    const tip = await getStudyTip(category);
    setActiveTip(tip);
    setLoadingTip(false);
  };

  const renderHome = () => (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4 animate-fadeIn">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">v2.5 Live on Play Store • <span className="text-slate-500 font-black">$2.99</span></span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Pass Your <span className="text-blue-600">Theory Test</span> First Time.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Join 500k+ learners using our AI-powered platform to master the UK Highway Code and ace the DVSA theory exam.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
            <button 
              onClick={() => startMockTest()}
              className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
            >
              Start Full Mock Test
            </button>
            <button 
              onClick={() => startPractice()}
              className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-lg hover:border-blue-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 active:scale-95"
            >
              Daily Practice
            </button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 opacity-80">
            <div className="flex flex-col items-start gap-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                alt="Get it on Google Play" 
                className="play-store-badge cursor-pointer"
                onClick={() => alert("This is a demo! In a real scenario, this would link to your Play Store listing.")}
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">One-time purchase • $2.99</span>
            </div>
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="text-sm font-bold text-blue-600 flex items-center gap-2 hover:underline bg-blue-50 px-4 py-2 rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Install Now
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 relative hidden lg:block">
           <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
           <div className="relative bg-slate-900 rounded-[3rem] p-4 shadow-2xl border-8 border-slate-800 w-[320px] mx-auto transform rotate-3">
              <div className="bg-slate-50 rounded-[2rem] overflow-hidden aspect-[9/19.5] relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10"></div>
                  <div className="p-4 pt-10 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-black">L</div>
                    <div className="h-4 w-3/4 bg-slate-200 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-200 rounded mx-auto mb-8"></div>
                    <div className="space-y-3">
                      <div className="h-10 w-full bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400">Premium Content Locked</div>
                      <div className="h-10 w-full bg-white rounded-lg border border-slate-100 shadow-sm"></div>
                      <div className="h-10 w-full bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">$2.99 - Unlock Now</div>
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 group hover:border-blue-200 transition-colors">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-2xl font-black mb-4">Topic Practice</h3>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">Focus on specific areas like Hazard Awareness or Motorway Rules.</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 4).map(cat => (
              <button 
                key={cat}
                onClick={() => startPractice(cat as Category)}
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
              >
                {cat}
              </button>
            ))}
            <button className="text-xs font-bold text-blue-600 px-2 py-1 underline">Browse all Topics</button>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
             <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45zM11 11v4h2v-4h-2zm0 6v2h2v-2h-2z" /></svg>
          </div>
          <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-2xl font-black mb-4">AI Explainer</h3>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed">Stuck on a rule? Our Gemini AI engine breaks down the Highway Code for you in plain English.</p>
          <button 
            onClick={() => fetchTip("Safety Margins")}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-colors text-sm"
          >
            {loadingTip ? "Generating Tip..." : "Get Random Study Tip"}
          </button>
          {activeTip && (
            <div className="mt-4 p-4 bg-blue-600/20 rounded-xl border border-blue-500/30 animate-slideUp">
              <p className="text-xs italic text-blue-100 font-medium leading-relaxed">"{activeTip}"</p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black mb-2">My Progress</h3>
            <p className="text-slate-500 text-sm mb-6">Track your scores and see your readiness for the real DVSA test.</p>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">Readiness Score</span>
                <span className="text-xl font-black text-blue-600">
                   {testResults.length > 0 
                      ? Math.round(testResults.filter(r => r.passed).length / testResults.length * 100)
                      : 0}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${testResults.length > 0 ? (testResults.filter(r => r.passed).length / testResults.length * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setMode(AppMode.DASHBOARD)}
            className="w-full py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-colors"
          >
            Open Stats Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const renderPractice = () => (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4 animate-slideIn">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Practice Session</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
            Question {questionIndex + 1} <span className="mx-2">/</span> {currentQuestions.length}
          </p>
        </div>
        <button 
          onClick={() => setMode(AppMode.HOME)}
          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-red-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <QuestionCard 
        question={currentQuestions[questionIndex]} 
        onAnswer={handleAnswer} 
      />

      <div className="mt-12 flex justify-center">
        <button 
          onClick={nextQuestion}
          className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl transform active:scale-95"
        >
          {questionIndex < currentQuestions.length - 1 ? "Keep Going →" : "Finish Practice"}
        </button>
      </div>
    </div>
  );

  const renderMockTest = () => (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4">
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] mb-10 flex flex-col md:flex-row justify-between items-center shadow-2xl gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-red-600 rounded-2xl font-black text-2xl tabular-nums animate-pulse">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Official Mock Exam</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pass Mark: 86%</p>
          </div>
        </div>
        <div className="w-full md:w-64 text-right">
          <div className="flex justify-between text-[10px] font-black uppercase mb-1 px-1">
             <span>Exam Progress</span>
             <span>{Math.round(((questionIndex + 1) / currentQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              style={{ width: `${((questionIndex + 1) / currentQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <QuestionCard 
        key={questionIndex}
        question={currentQuestions[questionIndex]} 
        onAnswer={handleAnswer}
        isMockTest={true}
      />

      <div className="mt-12 flex justify-between items-center gap-4">
        <button 
          onClick={() => {if(confirm("Exit exam? Your progress will be lost.")){setMode(AppMode.HOME);}}}
          className="px-8 py-5 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 rounded-2xl transition-colors"
        >
          Abort Exam
        </button>
        <button 
          onClick={nextQuestion}
          className="flex-1 max-w-md py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl active:scale-95"
        >
          {questionIndex < currentQuestions.length - 1 ? "Next Question" : "Finalize & Submit"}
        </button>
      </div>
    </div>
  );

  const renderReview = () => {
    const lastResult = testResults[0];
    if (!lastResult) return renderHome();

    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center animate-fadeIn">
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 border-8 shadow-2xl ${lastResult.passed ? 'border-green-500 text-green-500 bg-green-50' : 'border-red-500 text-red-500 bg-red-50'}`}>
          {lastResult.passed ? (
             <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
          ) : (
             <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </div>
        <h2 className="text-5xl font-black mb-4 text-slate-900 tracking-tight">
           {lastResult.passed ? 'PASSED!' : 'UNSUCCESSFUL'}
        </h2>
        <p className="text-xl text-slate-600 mb-12 font-medium">
          You scored <span className="font-black text-slate-900">{lastResult.score} / {lastResult.total}</span>.
          {lastResult.passed ? ' Outstanding performance, you are test-ready!' : ' Keep pushing! Focus on the topics you missed.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</p>
            <p className="text-2xl font-black text-slate-800">{Math.floor(lastResult.timeTaken / 60)}m {lastResult.timeTaken % 60}s</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy Rate</p>
            <p className="text-2xl font-black text-slate-800">{Math.round((lastResult.score / lastResult.total) * 100)}%</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button 
            onClick={() => startMockTest()}
            className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl active:scale-95"
          >
            Retake Exam
          </button>
          <button 
            onClick={() => setMode(AppMode.HOME)}
            className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Learning Insights</h1>
          <p className="text-slate-500 font-medium">Detailed breakdown of your practice history</p>
        </div>
        <button 
          onClick={() => { if(confirm("Clear all data?")){localStorage.removeItem('drive_test_results'); setTestResults([]);} }}
          className="px-6 py-3 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 rounded-xl border border-red-100 transition-colors"
        >
          Reset Statistics
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Total Attempts</h4>
          <p className="text-5xl font-black text-blue-600">{testResults.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Pass Rate</h4>
          <p className="text-5xl font-black text-green-600">
            {testResults.length > 0 
              ? Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)
              : 0}%
          </p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <h4 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Avg. Accuracy</h4>
          <p className="text-5xl font-black text-slate-900">
            {testResults.length > 0 
              ? Math.round(testResults.reduce((acc, r) => acc + (r.score / r.total), 0) / testResults.length * 100)
              : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-2xl text-slate-800">Exam History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-10 py-6">Session Date</th>
                <th className="px-10 py-6">Score Card</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {testResults.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                       <p className="font-bold text-xl uppercase tracking-widest">No Data Recorded</p>
                    </div>
                  </td>
                </tr>
              ) : (
                testResults.map((res, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-8 font-bold text-slate-700">{res.date}</td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2">
                         <span className="text-xl font-black text-slate-900">{res.score}</span>
                         <span className="text-slate-300 font-bold">/</span>
                         <span className="text-slate-400 font-bold">{res.total}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${res.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {res.passed ? 'Qualified' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-slate-500 font-medium">
                       {Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 selection:bg-blue-100 selection:text-blue-900">
      <Header currentMode={mode} setMode={setMode} />
      
      <main className="relative z-0">
        {mode === AppMode.HOME && renderHome()}
        {mode === AppMode.PRACTICE && renderPractice()}
        {mode === AppMode.MOCK_TEST && renderMockTest()}
        {mode === AppMode.REVIEW && renderReview()}
        {mode === AppMode.DASHBOARD && renderDashboard()}
      </main>

      {/* Floating Action Button for Mobile Store Experience */}
      {mode === AppMode.HOME && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full px-6 md:hidden">
           <button 
            onClick={() => startMockTest()}
            className="w-full py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] animate-bounce-slow flex items-center justify-center gap-3 active:scale-95"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168l4.74 3.555a.5.5 0 010 .894l-4.74 3.555A.5.5 0 019 14.737V7.263a.5.5 0 01.555-.495z" /></svg>
                <span>Launch Exam</span>
              </div>
              <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-0.5">$2.99 Single Purchase</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
