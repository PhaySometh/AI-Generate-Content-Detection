// frontend/components/ImageAnalyzer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { analyzeImage, analyzeUrl } from '@/lib/api';
import { DetectionResult } from '@/lib/types';

import Header from './detectron/Header';
import InputSection from './detectron/InputSection';
import ResultScreen from './detectron/ResultScreen';

export default function ImageAnalyzer() {
    const [tab, setTab] = useState<'upload' | 'url'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState('');
    const [showHeatmap, setShowHeatmap] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileSelect = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select a valid image file (JPG, PNG, WebP)');
            return;
        }
        setFile(selectedFile);
        setError('');
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const newPreview = URL.createObjectURL(selectedFile);
        setPreviewUrl(newPreview);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const startAnalysis = async () => {
        setError('');
        setIsAnalyzing(true);
        setResult(null);
        setShowHeatmap(false);

        try {
            let data: DetectionResult;
            if (tab === 'upload' && file) {
                data = await analyzeImage(file);
            } else if (tab === 'url' && urlInput.trim()) {
                data = await analyzeUrl(urlInput.trim());
            } else {
                throw new Error('Please provide an image or valid URL');
            }
            setResult(data);
        } catch (err: any) {
            setError(err?.message || 'Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAll = () => {
        setFile(null);
        setUrlInput('');
        setPreviewUrl('');
        setResult(null);
        setError('');
        setShowHeatmap(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const isAnalyzeDisabled = (tab === 'upload' && !file) || (tab === 'url' && !urlInput.trim());

    return (
        <div className="min-h-screen bg-[#07090c] text-[#d4dae6] font-['Syne'] overflow-x-hidden">
            <Header />

            <div className="max-w-[720px] mx-auto px-6 py-12">
                {!result ? (
                    <InputSection
                        tab={tab}
                        setTab={setTab}
                        file={file}
                        urlInput={urlInput}
                        setUrlInput={setUrlInput}
                        error={error}
                        isAnalyzing={isAnalyzing}
                        isAnalyzeDisabled={isAnalyzeDisabled}
                        onFileSelect={handleFileSelect}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onStartAnalysis={startAnalysis}
                        fileInputRef={fileInputRef}
                    />
                ) : (
                    <ResultScreen
                        result={result}
                        previewUrl={previewUrl}
                        showHeatmap={showHeatmap}
                        setShowHeatmap={setShowHeatmap}
                        onReset={resetAll}
                    />
                )}
            </div>
        </div>
    );
}