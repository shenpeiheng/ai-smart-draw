"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronsUp, ChevronsDown } from "lucide-react";

interface ResizablePanelProps {
  children: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
  onHeightChange?: (height: number) => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function ResizablePanel({
  children,
  minHeight = 100,
  maxHeight = 500,
  defaultHeight = 208, // Approximately h-52
  onHeightChange,
  isCollapsed = false,
  onToggle,
}: ResizablePanelProps) {
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousHeight = useRef(height);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      
      const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
      setHeight(clampedHeight);
      onHeightChange?.(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minHeight, maxHeight, onHeightChange]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Add toggle button to the resize handle area
  return (
    <div 
      ref={containerRef}
      className="relative"
      style={{ height: isCollapsed ? '32px' : `${height}px` }}
    >
      <div 
        className="absolute top-0 left-0 right-0 cursor-row-resize h-2 z-10 flex items-center justify-center"
        onMouseDown={startResizing}
      >
        <div className="w-8 h-1 bg-gray-400 rounded-full opacity-70 hover:opacity-100"></div>
      </div>
      <div className="h-full pt-1 flex flex-col">
        {isCollapsed ? (
          <div className="flex justify-end">
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="展开"
                aria-label="Expand panel"
              >
                <ChevronsUp className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}