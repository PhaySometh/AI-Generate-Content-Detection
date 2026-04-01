interface Props {
  label: "REAL" | "AI_GENERATED";
  confidence: number;
  confidence_pct: string;
}

export default function ResultCard({ label, confidence, confidence_pct }: Props) {
  const isAI = label === "AI_GENERATED";

  const barColor =
    isAI
      ? confidence >= 0.7 ? "bg-red-500" : "bg-yellow-400"
      : confidence >= 0.7 ? "bg-green-500" : "bg-yellow-400";

  const badgeBg = isAI ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";
  const badgeText = isAI ? "AI-GENERATED" : "REAL";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <span className={`rounded-full px-4 py-1.5 text-sm font-bold tracking-wide ${badgeBg}`}>
          {badgeText}
        </span>
        <span className="text-2xl font-bold text-gray-900">{confidence_pct}</span>
        <span className="text-sm text-gray-500">confidence</span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>100%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-3 rounded-full transition-all ${barColor}`}
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
