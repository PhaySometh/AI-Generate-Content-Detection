import { FormEvent, useState } from "react";

interface Props {
  onUrl: (url: string) => void;
  disabled?: boolean;
}

export default function UrlInput({ onUrl, disabled }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onUrl(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">
        Image or video URL
      </label>
      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://example.com/image.jpg"
        disabled={disabled}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
          disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
          hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        Analyze URL
      </button>
    </form>
  );
}
