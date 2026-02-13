
import React from 'react';
import { HomeworkAnalysis } from '../types';

interface AnalysisViewProps {
  analysis: HomeworkAnalysis;
  onContinue: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onContinue }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {analysis.subject}
          </span>
          <h2 className="text-2xl font-bold text-slate-800">{analysis.topic}</h2>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            {analysis.explanation}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-50 p-6 rounded-2xl">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Points
            </h3>
            <ul className="space-y-3">
              {analysis.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-600">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col justify-center items-center p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
            <p className="text-indigo-800 font-medium mb-4">Want to see this in action?</p>
            <button
              onClick={onContinue}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all w-full"
            >
              Visualize Explanation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
