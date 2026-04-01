import { useState } from "react";
import { useRouter } from "next/router";
import { analyzeImage, analyzeUrl } from "@/lib/api";
import { ApiError } from "@/lib/types";
import UploadBox from "@/components/UploadBox";
import UrlInput from "@/components/UrlInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBanner from "@/components/ErrorBanner";

type Tab = "upload" | "url";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setIsLoading(true);
    try {
      const result = await analyzeImage(file);
      router.push(`/result/${result.id}`);
    } catch (err) {
      setError(err as ApiError);
      setIsLoading(false);
    }
  }

  async function handleUrl(url: string) {
    setError(null);
    setIsLoading(true);
    try {
      const result = await analyzeUrl(url);
      router.push(`/result/${result.id}`);
    } catch (err) {
      setError(err as ApiError);
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Image Detector</h1>
          <p className="mt-2 text-gray-500">
            Upload an image or paste a URL to detect whether it was AI-generated or real.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {error && (
                <div className="mb-5">
                  <ErrorBanner error={error} />
                </div>
              )}

              <div className="mb-6 flex rounded-lg border border-gray-200 p-1">
                {(["upload", "url"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setError(null); }}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors
                      ${activeTab === tab
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab === "upload" ? "Upload File" : "Paste URL"}
                  </button>
                ))}
              </div>

              {activeTab === "upload" ? (
                <UploadBox onFile={handleFile} />
              ) : (
                <UrlInput onUrl={handleUrl} />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
