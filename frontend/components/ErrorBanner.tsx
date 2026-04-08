// frontend/components/detectron/ErrorBanner.tsx
import React from 'react';

type Props = {
    message: string;        // ← must be 'message'
};

export default function ErrorBanner({ message }: Props) {
    return (
        <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono rounded-xl">
            {message}
        </div>
    );
}