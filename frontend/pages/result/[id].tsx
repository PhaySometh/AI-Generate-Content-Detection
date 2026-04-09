// frontend/pages/result/[id].tsx
import { GetServerSideProps } from "next";
import Link from "next/link";
import { getResult } from "@/lib/api";
import { DetectionResult } from "@/lib/types";

import Header from "@/components/detectron/Header";
import ImagePreview from "@/components/detectron/ImagePreview";
import VerdictPanel from "@/components/detectron/VerdictPanel";
import AnalysisExplanation from "@/components/detectron/AnalysisExplanation";
import MetadataPanel from "@/components/detectron/MetadataPanel";
import ErrorBanner from "@/components/ErrorBanner";

interface Props {
  result: DetectionResult | null;
  error: string | null;
  previewUrl: string;
}

export default function ResultPage({ result, error, previewUrl }: Props) {
  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#07090c] text-[#d4dae6]">
        <Header />
        <div className="max-w-[720px] mx-auto px-6 py-12">
          <ErrorBanner message={error ?? "Result not found"} />   {/* ← Fixed: use 'message' */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 border border-white/10 hover:border-[#1ed8cc] rounded-2xl text-sm font-mono tracking-widest transition-colors"
            >
              ← BACK TO HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090c] text-[#d4dae6] font-['Syne'] overflow-x-hidden">
      <Header />

      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="px-6 py-3 border border-white/10 hover:border-[#1ed8cc] text-xs font-mono tracking-widest rounded-2xl transition-colors"
          >
            ← NEW ANALYSIS
          </Link>
          <div className="font-mono text-xs text-[#2a3040]">
            ID: {result.id?.slice(0, 12)}...
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ImagePreview
            result={result}
            previewUrl={previewUrl}
            showHeatmap={false}
            setShowHeatmap={() => { }}
          />
          <VerdictPanel result={result} />
        </div>

        <AnalysisExplanation explanation={result.explanation} />
        <MetadataPanel result={result} />

        <div className="mt-10">
          <Link
            href="/"
            className="block w-full py-5 border border-white/10 hover:border-white/30 text-sm font-mono tracking-widest rounded-2xl text-center transition-all"
          >
            + ANALYZE ANOTHER IMAGE
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const id = context.params?.id as string;
  const previewUrl = (context.query.previewUrl as string) || "";

  if (!id) {
    return { props: { result: null, error: "Invalid result ID", previewUrl } };
  }

  try {
    const result = await getResult(id);
    return { props: { result, error: null, previewUrl } };
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "error" in err
        ? String((err as { error: string }).error)
        : "Failed to load result";

    return { props: { result: null, error: message, previewUrl } };
  }
};