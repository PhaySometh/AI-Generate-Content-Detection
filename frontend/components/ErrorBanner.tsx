import { ApiError } from "@/lib/types";

interface Props {
  error: ApiError | string;
}

export default function ErrorBanner({ error }: Props) {
  const message = typeof error === "string" ? error : error.error;
  const detail = typeof error === "object" ? error.detail : undefined;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">{message}</p>
      {detail && <p className="mt-1 text-red-600">{detail}</p>}
    </div>
  );
}
