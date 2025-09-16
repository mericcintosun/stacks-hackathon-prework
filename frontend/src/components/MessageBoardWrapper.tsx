"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ErrorBoundary from "./ErrorBoundary";

// Dynamic import to avoid SSR issues
const MessageBoardContent = dynamic(() => import("./MessageBoardContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading MessageBoard...</p>
        <p className="text-sm text-gray-500 mt-2">
          Initializing wallet connection...
        </p>
      </div>
    </div>
  ),
});

export default function MessageBoardWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-32 w-32 bg-gray-300 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Preparing MessageBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MessageBoardContent />
    </ErrorBoundary>
  );
}
