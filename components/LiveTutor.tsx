
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Modality, LiveServerMessage } from '@google/genai';
import { getGeminiClient } from '../services/geminiService';
import { decode, decodeAudioData, createPcmBlob } from '../utils/audio-utils';
import { HomeworkAnalysis } from '../types';

interface LiveTutorProps {
  analysis: HomeworkAnalysis;
  onClose: () => void;
}

const LiveTutor: React.FC<LiveTutorProps> = ({ analysis, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startSession = useCallback(async () => {
    try {
      // Ensure user has selected an API key before starting the live session
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const ai = getGeminiClient();
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              // Use sessionPromise.then to ensure data is sent to the resolved session
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev, `AI: ${message.serverContent?.outputTranscription?.text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev, `You: ${message.serverContent?.inputTranscription?.text}`]);
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              // Correct audio scheduling to ensure gapless playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) {
                try { s.stop(); } catch {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Live Tutor Error:', e);
            if (e.message?.includes("Requested entity was not found")) {
              window.aistudio.openSelectKey();
            }
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are an encouraging and patient tutor for a student studying ${analysis.subject} and specifically ${analysis.topic}. Use the following context: ${analysis.explanation}. Guide the student through problems by asking leading questions rather than just giving answers.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Failed to start tutoring session:", err);
      if (err.message?.includes("Requested entity was not found")) {
        window.aistudio.openSelectKey();
      }
    }
  }, [analysis]);

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) {
        audioContextRef.current.input.close().catch(() => {});
        audioContextRef.current.output.close().catch(() => {});
      }
    };
  }, [startSession]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col h-[80vh] shadow-2xl">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live Tutor: {analysis.topic}
            </h2>
            <p className="text-indigo-100 text-sm">Ask me anything about your homework!</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {transcription.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-indigo-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-10-5a3 3 0 11-6 0 3 3 0 016 0zm15 0a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p>Speak clearly into your microphone...</p>
            </div>
          ) : (
            transcription.map((line, i) => (
              <div key={i} className={`flex ${line.startsWith('You') ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${line.startsWith('You') ? 'bg-indigo-600 text-white' : 'bg-white shadow-sm border border-slate-100'}`}>
                  {line}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-center">
          <div className="flex items-center gap-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100' : 'bg-slate-100'}`}>
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 scale-125 transition-transform duration-300' : 'bg-slate-400'}`}></div>
            </div>
            <p className="font-semibold text-slate-700">{isActive ? 'Listening...' : 'Connecting...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTutor;
