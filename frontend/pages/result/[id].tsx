import { GetServerSideProps } from "next";
import Link from "next/link";
import { getResult } from "@/lib/api";
import { DetectionResult } from "@/lib/types";
import ResultCard from "@/components/ResultCard";
import HeatmapViewer from "@/components/HeatmapViewer";
import ExplanationBox from "@/components/ExplanationBox";
import ErrorBanner from "@/components/ErrorBanner";

interface Props {
  result: DetectionResult | null;
  error: string | null;
}

export default function ResultPage({ result, error }: Props) {
  // Fallback UI when SSR fetch fails or the ID is not found.
  if (error || !result) {
    return (
      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="mx-auto max-w-lg">
          <ErrorBanner error={error ?? "Result not found"} />
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    // Main result presentation: prediction summary, heatmap, and explanation.
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Analysis Result</h1>
          {result.original_filename && (
            <p className="mt-1 text-sm text-gray-500">
              {result.original_filename}
            </p>
          )}
          {result.source_url && (
            <p className="mt-1 truncate text-sm text-gray-500">
              {result.source_url}
            </p>
          )}
        </div>

        <ResultCard
          label={result.label}
          confidence={result.confidence}
          confidence_pct={result.confidence_pct}
        />

        <HeatmapViewer heatmap_b64={result.heatmap_b64} />

        <ExplanationBox explanation={result.explanation} />

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Model: {result.model_version}</span>
          <span>Processed in {result.processing_ms}ms</span>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Analyze another image
          </Link>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  // Server-side fetch prevents exposing internal service topology to the browser.
  const id = context.params?.id as string;
  try {
    const result = await getResult(id);
    return { props: { result, error: null } };
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "error" in err
        ? String((err as { error: string }).error)
        : "Failed to load result";
    return { props: { result: null, error: message } };
  }
};
