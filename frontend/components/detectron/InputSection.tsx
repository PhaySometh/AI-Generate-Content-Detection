// frontend/components/detectron/InputSection.tsx
import React from 'react';
import UploadArea from './UploadArea';
import UrlInput from './UrlInput';

type InputSectionProps = {
    tab: 'upload' | 'url';
    setTab: (tab: 'upload' | 'url') => void;
    file: File | null;
    urlInput: string;
    setUrlInput: (url: string) => void;
    error: string;
    isAnalyzing: boolean;
    isAnalyzeDisabled: boolean;
    onFileSelect: (file: File) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onStartAnalysis: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
};

export default function InputSection({
    tab,
    setTab,
    file,
    urlInput,
    setUrlInput,
    error,
    isAnalyzing,
    isAnalyzeDisabled,
    onFileSelect,
    onDrop,
    onDragOver,
    onStartAnalysis,
    fileInputRef,
}: InputSectionProps) {
    return (
        <div>
            <div className="mb-10">
                <h1 className="text-5xl md:text-6xl font-bold leading-none tracking-tighter">
                    Detect<br />
                    <span className="text-[#1ed8cc]">AI-Generated</span><br />
                    Images Instantly
                </h1>
                <p className="font-mono text-sm text-[#5b6577] mt-4 tracking-wider">
                    94%+ accuracy • Grad-CAM explainability • Real-time inference
                </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#0d1117] border border-white/10 rounded-xl p-1 w-fit mb-8">
                <button
                    onClick={() => setTab('upload')}
                    className={`px-8 py-3 text-xs font-mono tracking-widest uppercase transition-all rounded-lg ${tab === 'upload'
                            ? 'bg-[#1ed8cc]/10 text-[#1ed8cc] border border-[#1ed8cc]/30'
                            : 'text-[#5b6577]'
                        }`}
                >
                    Upload File
                </button>
                <button
                    onClick={() => setTab('url')}
                    className={`px-8 py-3 text-xs font-mono tracking-widest uppercase transition-all rounded-lg ${tab === 'url'
                            ? 'bg-[#1ed8cc]/10 text-[#1ed8cc] border border-[#1ed8cc]/30'
                            : 'text-[#5b6577]'
                        }`}
                >
                    Paste URL
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono rounded-xl">
                    {error}
                </div>
            )}

            {tab === 'upload' ? (
                <UploadArea
                    file={file}
                    onFileSelect={onFileSelect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fileInputRef={fileInputRef}
                />
            ) : (
                <UrlInput urlInput={urlInput} setUrlInput={setUrlInput} />
            )}

            <button
                onClick={onStartAnalysis}
                disabled={isAnalyzeDisabled || isAnalyzing}
                className="mt-8 w-full py-5 bg-[#1ed8cc] hover:bg-[#1ed8cc]/90 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold tracking-widest text-sm uppercase rounded-2xl transition-all active:scale-[0.985]"
            >
                {isAnalyzing ? "ANALYZING..." : "ANALYZE IMAGE"}
            </button>

            <div className="text-center text-[#2a3040] text-xs font-mono mt-6 flex items-center justify-center gap-8">
                <div>Supports video frame extraction</div>
                <div>Results stored in PostgreSQL</div>
            </div>
        </div>
    );
}