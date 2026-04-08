// frontend/components/detectron/ImagePreview.tsx
import React from 'react';
import { DetectionResult } from '@/lib/types';

type ImagePreviewProps = {
    result: DetectionResult;
    previewUrl: string;
    showHeatmap: boolean;
    setShowHeatmap: (show: boolean) => void;
};

export default function ImagePreview({ result, previewUrl, showHeatmap, setShowHeatmap }: ImagePreviewProps) {
    return (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] bg-black">
            <img
                src={
                    showHeatmap && result.heatmap_b64
                        ? `data:image/png;base64,${result.heatmap_b64}`
                        : previewUrl
                }
                alt="Analysis"
                className="w-full h-full object-cover"
            />
            {result.heatmap_b64 && (
                <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className="absolute bottom-4 right-4 bg-black/80 border border-white/20 hover:border-[#1ed8cc] text-white text-xs font-mono px-5 py-2.5 rounded-2xl transition-all"
                >
                    {showHeatmap ? "SHOW ORIGINAL" : "SHOW HEATMAP"}
                </button>
            )}
        </div>
    );
}