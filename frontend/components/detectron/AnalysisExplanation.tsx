// frontend/components/detectron/AnalysisExplanation.tsx
import React from 'react';

type Props = {
    explanation: string;
};

export default function AnalysisExplanation({ explanation }: Props) {
    return (
        <div className="bg-[#0d1117] border border-white/10 rounded-3xl p-8 mb-6">
            <div className="uppercase text-[#2a3040] text-xs font-mono tracking-widest mb-4">MODEL ANALYSIS</div>
            <p className="text-[#a3a8b8] leading-relaxed text-[15px]">
                {explanation}
            </p>
        </div>
    );
}