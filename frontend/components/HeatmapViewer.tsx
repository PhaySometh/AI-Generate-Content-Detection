import { useState } from "react";

interface Props {
  heatmap_b64: string | null;
}

export default function HeatmapViewer({ heatmap_b64 }: Props) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  if (!heatmap_b64) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Heatmap unavailable
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Grad-CAM Heatmap</h2>
        <button
          onClick={() => setShowHeatmap((v) => !v)}
          className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600
            hover:bg-gray-50 transition-colors"
        >
          {showHeatmap ? "Hide heatmap" : "Show heatmap"}
        </button>
      </div>

      {showHeatmap ? (
        <img
          src={`data:image/png;base64,${heatmap_b64}`}
          alt="Grad-CAM heatmap overlay"
          className="w-full rounded-lg object-contain"
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          Heatmap hidden
        </div>
      )}

      <p className="mt-2 text-xs text-gray-400">
        Red/yellow regions are where the model focused its attention.
      </p>
    </div>
  );
}
