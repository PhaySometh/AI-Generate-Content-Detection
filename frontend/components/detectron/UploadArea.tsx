// frontend/components/detectron/UploadArea.tsx
import React from 'react';

type UploadAreaProps = {
    file: File | null;
    onFileSelect: (file: File) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
};

export default function UploadArea({ file, onFileSelect, onDrop, onDragOver, fileInputRef }: UploadAreaProps) {
    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-[#2a3040] hover:border-[#1ed8cc] bg-[#0d1117] rounded-3xl h-[280px] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-[linear-gradient(#2a3040_1px,transparent_1px),linear-gradient(90deg,#2a3040_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#1ed8cc] to-transparent animate-[scan_3s_linear_infinite]" />

            <div className="w-14 h-14 border border-[#5b6577] rounded-2xl flex items-center justify-center mb-6 group-hover:border-[#1ed8cc] transition-colors">
                <svg width="28" height="28" fill="none" stroke="#5b6577" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
            </div>
            <p className="text-lg font-semibold text-[#5b6577] group-hover:text-[#1ed8cc] transition-colors">
                {file ? file.name : "Drop image here or click to browse"}
            </p>
            <p className="text-xs text-[#2a3040] font-mono mt-2">
                JPG • PNG • WebP • Max 10 MB
            </p>

            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
            />
        </div>
    );
}