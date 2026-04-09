// frontend/pages/index.tsx
import React from 'react';
import ImageAnalyzer from '@/components/ImageAnalyzer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07090c] text-[#d4dae6] font-['Syne'] overflow-x-hidden">
      <ImageAnalyzer />
    </div>
  );
}