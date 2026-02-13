
import React, { useState } from 'react';
import { HomeworkAnalysis, GenerationState } from '../types';
import { generateExplanatoryImage, generateExplanatoryVideo } from '../services/geminiService';

interface VisualizerProps {
  analysis: HomeworkAnalysis;
  onTalkToTutor: () => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ analysis, onTalkToTutor }) => {
  const [imageState, setImageState] = useState<GenerationState>({ loading: false, error: null, resultUrl: null });
  const [videoState, setVideoState] = useState<GenerationState>({ loading: false, error: null, resultUrl: null });

  const handleGenerateImage = async () => {
    setImageState({ loading: true, error: null, resultUrl: null });
    try {
      const url = await generateExplanatoryImage(analysis.visualPrompt);
      setImageState({ loading: false, error: null, resultUrl: url });
    } catch (e: any) {
      setImageState({ loading: false, error: e.message, resultUrl: null });
    }
  };

  const handleGenerateVideo = async () => {
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
      
      setVideoState({ loading: true, error: null, resultUrl: null });
      const url = await generateExplanatoryVideo(analysis.videoPrompt);
      setVideoState({ loading: false, error: null, resultUrl: url });
    } catch (e: any) {
      // If the request fails with an error message containing "Requested entity was not found.", 
      // reset the key selection state and prompt the user to select a key again via openSelectKey().
      if (e.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
      setVideoState({ loading: false, error: e.message, resultUrl: null });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Photo Explanation */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Visual Diagram
          </h3>
          <p className="text-slate-500 mb-6">Generate a detailed diagram or mnemonic to help you remember the concept.</p>
          
          <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border overflow-hidden relative group">
            {imageState.resultUrl ? (
              <img src={imageState.resultUrl} className="w-full h-full object-cover" alt="Generated explanation" />
            ) : imageState.loading ? (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-indigo-600 font-medium">Painting your explanation...</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateImage}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                Generate Photo
              </button>
            )}
            {imageState.error && <p className="absolute bottom-4 px-4 text-red-500 text-sm font-medium">{imageState.error}</p>}
          </div>
        </div>

        {/* Video Explanation */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video Lesson
          </h3>
          <p className="text-slate-500 mb-6">Create a high-quality video walkthrough of this specific homework problem.</p>
          
          <div className="aspect-video bg-slate-50 rounded-2xl flex items-center justify-center border overflow-hidden relative group">
            {videoState.resultUrl ? (
              <video src={videoState.resultUrl} controls className="w-full h-full object-cover" />
            ) : videoState.loading ? (
              <div className="text-center p-8">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-indigo-600 font-medium mb-2">Generating Video Lesson...</p>
                <p className="text-slate-400 text-sm">This can take up to 2 minutes. Feel free to wait or check your diagrams!</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateVideo}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md"
              >
                Generate Video
              </button>
            )}
            {videoState.error && <p className="absolute bottom-4 px-4 text-red-500 text-sm font-medium">{videoState.error}</p>}
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <button
          onClick={onTalkToTutor}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-3 mx-auto shadow-2xl"
        >
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Interactive Tutoring Session
        </button>
      </div>
    </div>
  );
};

export default Visualizer;
