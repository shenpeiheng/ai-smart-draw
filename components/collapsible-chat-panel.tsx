"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Github } from "lucide-react";
import ChatPanel from "@/components/chat-panel";
import ExcalidrawChatPanel from "@/components/excalidraw-chat-panel";
import MermaidChatPanel from "@/components/mermaid-chat-panel";
import PlantUMLChatPanel from "@/components/plantuml-chat-panel";
import KrokiChatPanel from "@/components/kroki-chat-panel";
import GraphvizChatPanel from "@/components/graphviz-chat-panel";
import { ModelConfigDialog } from "@/components/model-config-dialog";
import { cn } from "@/lib/utils";

type PanelType = "drawio" | "excalidraw" | "mermaid" | "plantuml" | "kroki" | "graphviz";

interface CollapsibleChatPanelProps {
  type: PanelType;
  className?: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function CollapsibleChatPanel({ 
  type,
  className = "",
  onCollapseChange
}: CollapsibleChatPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const renderChatPanel = () => {
    switch (type) {
      case "drawio":
        return <ChatPanel />;
      case "excalidraw":
        return <ExcalidrawChatPanel />;
      case "mermaid":
        return <MermaidChatPanel />;
      case "plantuml":
        return <PlantUMLChatPanel />;
      case "kroki":
        return <KrokiChatPanel />;
      case "graphviz":
        return <GraphvizChatPanel />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <>
      {/* Floating AI button shown when panel is collapsed */}
      {isCollapsed && (
        <div className={cn("absolute right-4 top-20 z-50", className)}>
          <Button
            onClick={() => setIsCollapsed(false)}
            className="rounded-full shadow-lg h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-300 animate-pulse font-bold text-lg"
            size="icon"
          >
            AI
          </Button>
        </div>
      )}

      {/* Main panel container - always rendered but visibility controlled by CSS */}
      <div 
        className={cn("flex h-full relative overflow-hidden", className)}
        style={{ 
          display: isCollapsed ? 'none' : 'flex',
          position: 'relative'
        }}
      >
        <div className="flex-1 h-full">
          {renderChatPanel()}
        </div>
        <div className="absolute right-2 top-4 z-50 flex gap-1">
          <ModelConfigDialog size="sm" />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-8 px-2"
            title="GitHub shenpeiheng"
            onClick={() => window.open('https://github.com/shenpeiheng/ai-smart-draw', '_blank')}
          >
            <Github className="h-4 w-4" />
            {/*<span className="hidden sm:inline">GitHub</span>*/}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-8 px-2"
            title="关闭聊天区"
            onClick={() => setIsCollapsed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}