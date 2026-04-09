// frontend/components/detectron/VerdictPanel.tsx
import React from 'react';
import { DetectionResult } from '@/lib/types';

type VerdictPanelProps = {
    result: DetectionResult;
};

export default function VerdictPanel({ result }: VerdictPanelProps) {
    return (
        <div
            className={`rounded-3xl border p-8 flex flex-col items-center justify-center text-center transition-all ${result.label === 'AI_GENERATED'
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-[#1ed8cc]/30 bg-[#1ed8cc]/5'
                }`}
        >
            <div
                className={`inline-block px-5 py-1.5 text-xs font-mono tracking-[2px] rounded mb-4 ${result.label === 'AI_GENERATED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-[#1ed8cc]/10 text-[#1ed8cc] border border-[#1ed8cc]/30'
                    }`}
            >
                {result.label === 'AI_GENERATED' ? 'AI GENERATED' : 'REAL PHOTO'}
            </div>

            <div
                className={`text-5xl font-bold tracking-tighter mb-8 ${result.label === 'AI_GENERATED' ? 'text-red-400' : 'text-[#1ed8cc]'
                    }`}
            >
                {result.label === 'AI_GENERATED' ? 'SYNTHETIC' : 'AUTHENTIC'}
            </div>

            {/* Confidence Circle */}
            <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#161e2c" strokeWidth="9" />
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={result.label === 'AI_GENERATED' ? '#f05252' : '#1ed8cc'}
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={`${result.confidence * 264} 264`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                        className="text-2xl font-mono font-medium"
                        style={{ color: result.label === 'AI_GENERATED' ? '#f05252' : '#1ed8cc' }}
                    >
                        {result.confidence_pct}
                    </div>
                    <div className="text-[10px] font-mono text-[#5b6577] tracking-widest mt-1">CONFIDENCE</div>
                </div>
            </div>
        </div>
    );
}