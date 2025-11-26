"use client";
import React, { useState, useEffect } from "react";
import { DrawIoEmbed } from "react-drawio";
import { CollapsibleChatPanel } from "@/components/collapsible-chat-panel";
import { useDiagram } from "@/contexts/diagram-context";

export default function Home() {
    const { drawioRef, handleDiagramExport } = useDiagram();
    const [isMobile, setIsMobile] = useState(false);
    const [isChatCollapsed, setIsChatCollapsed] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Check on mount
        checkMobile();

        // Add event listener for resize
        window.addEventListener("resize", checkMobile);

        // Cleanup
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (isMobile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Please open this application on a desktop or laptop
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <div className={`h-full p-1 transition-all duration-300 ${isChatCollapsed ? 'w-full' : 'w-3/4'}`}>
                <DrawIoEmbed
                    ref={drawioRef}
                    onExport={handleDiagramExport}
                    urlParameters={{
                        ui: "simple",
                        spin: true,
                        libraries: false,
                        saveAndExit: false,
                        noExitBtn: true,
                        grid: true,
                    }}
                />
            </div>
            <div className={`h-full p-1 transition-all duration-300 ${isChatCollapsed ? 'w-0' : 'w-1/4'}`}>
                <CollapsibleChatPanel type="drawio" onCollapseChange={setIsChatCollapsed} />
            </div>
        </div>
    );
}