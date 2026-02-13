
import React, { useRef } from 'react';

interface UploaderProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onUpload, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 glass rounded-3xl border-2 border-dashed border-indigo-200 text-center transition-all hover:border-indigo-400">
      <div className="mb-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Upload Homework</h2>
        <p className="text-slate-500 mt-2">Take a photo of your assignment to get started.</p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center mx-auto gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analyzing...
          </>
        ) : (
          'Choose File'
        )}
      </button>
    </div>
  );
};

export default Uploader;
