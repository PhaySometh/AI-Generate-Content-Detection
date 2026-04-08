// frontend/components/HeatmapViewer.tsx
import React from 'react';

type Props = {
    heatmap_b64?: string;
    showHeatmap: boolean;
    onToggle: () => void;
};

export default function HeatmapViewer({ heatmap_b64, showHeatmap, onToggle }: Props) {
    if (!heatmap_b64) return null;

    return (
        <button
            onClick={onToggle}
            className="text-xs font-mono px-4 py-2 border border-white/20 rounded-xl hover:border-[#1ed8cc]"
        >
            {showHeatmap ? "Show Original" : "Show Heatmap"}
        </button>
    );
}