// frontend/components/detectron/ResultScreen.tsx
import React from 'react';
import ImagePreview from './ImagePreview';
import VerdictPanel from './VerdictPanel';
import AnalysisExplanation from './AnalysisExplanation';
import MetadataPanel from './MetadataPanel';
import { DetectionResult } from '@/lib/types';

type ResultScreenProps = {
    result: DetectionResult;
    previewUrl: string;
    showHeatmap: boolean;
    setShowHeatmap: (show: boolean) => void;
    onReset: () => void;
};

export default function ResultScreen({
    result,
    previewUrl,
    showHeatmap,
    setShowHeatmap,
    onReset,
}: ResultScreenProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onReset}
                    className="px-6 py-3 border border-white/10 hover:border-[#1ed8cc] text-xs font-mono tracking-widest rounded-2xl transition-colors"
                >
                    ← NEW ANALYSIS
                </button>
                <div className="font-mono text-xs text-[#2a3040]">
                    ID: {result.id?.slice(0, 12)}...
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <ImagePreview
                    result={result}
                    previewUrl={previewUrl}
                    showHeatmap={showHeatmap}
                    setShowHeatmap={setShowHeatmap}
                />
                <VerdictPanel result={result} />
            </div>

            <AnalysisExplanation explanation={result.explanation} />
            <MetadataPanel result={result} />

            <button
                onClick={onReset}
                className="mt-10 w-full py-5 border border-white/10 hover:border-white/30 text-sm font-mono tracking-widest rounded-2xl transition-all"
            >
                + ANALYZE ANOTHER IMAGE
            </button>
        </div>
    );
}