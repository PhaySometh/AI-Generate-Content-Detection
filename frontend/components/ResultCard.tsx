// frontend/components/ResultCard.tsx
import React from 'react';
import { DetectionResult } from '@/lib/types';

type Props = {
    result: DetectionResult;
};

export default function ResultCard({ result }: Props) {
    return (
        <div className="bg-[#0d1117] border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-medium mb-4">Detection Result</h3>
            <p>Label: <span className="font-mono">{result.label}</span></p>
            <p>Confidence: <span className="font-mono">{result.confidence_pct}</span></p>
        </div>
    );
}