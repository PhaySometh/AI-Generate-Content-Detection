// frontend/components/detectron/Header.tsx
import React from 'react';

export default function Header() {
    return (
        <header className="border-b border-white/10 py-5 px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-[#1ed8cc] rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 border border-[#1ed8cc] rounded-full" />
                </div>
                <span className="font-mono text-sm tracking-[2px] text-[#1ed8cc] font-medium">DETECTRON</span>
            </div>
            <div className="font-mono text-xs tracking-widest bg-[#0d1117] border border-white/10 px-4 py-1.5 rounded text-[#5b6577]">
                EfficientNet-B0 • v3
            </div>
        </header>
    );
}