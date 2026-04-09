// frontend/components/detectron/MetadataPanel.tsx
import React from 'react';
import { DetectionResult } from '@/lib/types';

type Props = {
    result: DetectionResult;
};

export default function MetadataPanel({ result }: Props) {
    return (
        <div className="bg-[#0d1117] border border-white/10 rounded-3xl p-8">
            <div className="uppercase text-[#2a3040] text-xs font-mono tracking-widest mb-6">RUN METADATA</div>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#111720] border border-white/10 rounded-2xl p-5">
                    <div className="text-xs text-[#5b6577]">MODEL</div>
                    <div className="font-mono mt-1">{result.model_version}</div>
                </div>
                <div className="bg-[#111720] border border-white/10 rounded-2xl p-5">
                    <div className="text-xs text-[#5b6577]">PROCESSING</div>
                    <div className="font-mono mt-1">{result.processing_ms}ms</div>
                </div>
                <div className="bg-[#111720] border border-white/10 rounded-2xl p-5">
                    <div className="text-xs text-[#5b6577]">SOURCE</div>
                    <div className="font-mono mt-1 capitalize">{result.source_type}</div>
                </div>
            </div>
        </div>
    );
}