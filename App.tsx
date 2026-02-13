
import React, { useState } from 'react';
import { AppStep, HomeworkAnalysis } from './types';
import { analyzeHomework } from './services/geminiService';
import Uploader from './components/Uploader';
import AnalysisView from './components/AnalysisView';
import Visualizer from './components/Visualizer';
import LiveTutor from './components/LiveTutor';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<HomeworkAnalysis | null>(null);
  const [showTutor, setShowTutor] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const result = await analyzeHomework(base64, file.type);
        setAnalysis(result);
        setStep(AppStep.ANALYSIS);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(AppStep.UPLOAD);
    setAnalysis(null);
    setShowTutor(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass border-b border-slate-200/50 px-6 py-4 mb-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={reset} className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-6 transition-transform">S</div>
            <span className="font-bold text-xl tracking-tight">StudyBuddy AI</span>
          </button>
          
          <div className="hidden md:flex items-center gap-4">
            <div className={`w-8 h-1 rounded-full ${step === AppStep.UPLOAD ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-1 rounded-full ${step === AppStep.ANALYSIS ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-1 rounded-full ${step === AppStep.VISUALIZE ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
          </div>

          <button onClick={reset} className="text-slate-500 hover:text-slate-800 font-medium text-sm">Reset</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        {step === AppStep.UPLOAD && (
          <div className="py-20 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Understand <span className="text-indigo-600">Homework</span> <br />Better with AI.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
              Upload a photo of any problem and let Gemini transform it into interactive visual explanations and videos.
            </p>
            <Uploader onUpload={handleUpload} loading={loading} />
          </div>
        )}

        {step === AppStep.ANALYSIS && analysis && (
          <AnalysisView analysis={analysis} onContinue={() => setStep(AppStep.VISUALIZE)} />
        )}

        {step === AppStep.VISUALIZE && analysis && (
          <Visualizer analysis={analysis} onTalkToTutor={() => setShowTutor(true)} />
        )}
      </main>

      {/* Modal Tutor */}
      {showTutor && analysis && (
        <LiveTutor analysis={analysis} onClose={() => setShowTutor(false)} />
      )}

      {/* Footer / Features bar */}
      {step === AppStep.UPLOAD && (
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Instant Analysis</h3>
              <p className="text-slate-500">Get deep conceptual breakdowns of any homework problem in seconds.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Video Explainers</h3>
              <p className="text-slate-500">AI generates custom 3D animations and videos to help you visualize the solution.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-10-5a3 3 0 11-6 0 3 3 0 016 0zm15 0a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Live Tutoring</h3>
              <p className="text-slate-500">Discuss concepts in real-time with a voice-activated AI tutor specialized in education.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
