// frontend/components/detectron/UrlInput.tsx
import React from 'react';

type UrlInputProps = {
    urlInput: string;
    setUrlInput: (url: string) => void;
};

export default function UrlInput({ urlInput, setUrlInput }: UrlInputProps) {
    return (
        <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg or YouTube/video URL"
            className="w-full bg-[#0d1117] border border-white/10 focus:border-[#1ed8cc] rounded-3xl px-8 py-6 text-sm font-mono placeholder:text-[#5b6577] outline-none"
        />
    );
}