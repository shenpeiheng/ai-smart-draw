"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExamplePanel from "./chat-example-panel";
import { UIMessage } from "ai";
import { useExcalidraw } from "@/contexts/excalidraw-context";

interface ExcalidrawChatMessageDisplayProps {
    messages: UIMessage[];
    error?: Error | null;
    setInput: (input: string) => void;
    setFiles: (files: File[]) => void;
}

export function ExcalidrawChatMessageDisplay({
    messages,
    error,
    setInput,
    setFiles,
}: ExcalidrawChatMessageDisplayProps) {
    const { applyScene, setSceneDraft } = useExcalidraw();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const processedToolCalls = useRef<Set<string>>(new Set());
    const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>(
        {}
    );
    const draftBufferRef = useRef<string | null>(null);
    const draftFlushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        messages.forEach((message) => {
            message.parts?.forEach((part: any) => {
                if (typeof part?.type !== "string") return;
                if (!part.type.startsWith("tool-")) return;

                const { toolCallId, state } = part;

                if (state === "output-available") {
                    setExpandedTools((prev) => ({
                        ...prev,
                        [toolCallId]: false,
                    }));
                }

                if (part.type === "tool-display_excalidraw") {
                    const scenePayload = part.input?.scene;
                    if (!scenePayload) {
                        return;
                    }
                    const serializedScene =
                        typeof scenePayload === "string"
                            ? scenePayload
                            : JSON.stringify(scenePayload, null, 2);

                    if (state === "input-streaming") {
                        // Throttle draft updates to reduce UI jank
                        draftBufferRef.current = serializedScene;
                        if (!draftFlushTimer.current) {
                            draftFlushTimer.current = setTimeout(() => {
                                if (draftBufferRef.current) {
                                    setSceneDraft(draftBufferRef.current);
                                }
                                draftFlushTimer.current = null;
                            }, 200);
                        }
                    } else if (
                        state === "output-available" &&
                        !processedToolCalls.current.has(toolCallId)
                    ) {
                        // apply final scene to canvas; clear draft buffer
                        if (draftFlushTimer.current) {
                            clearTimeout(draftFlushTimer.current);
                            draftFlushTimer.current = null;
                        }
                        draftBufferRef.current = null;
                        setSceneDraft(null);
                        applyScene(scenePayload, part.input.summary);
                        processedToolCalls.current.add(toolCallId);
                    }
                }
            });
        });
    }, [messages, applyScene, setSceneDraft]);

    const renderToolPart = (part: any) => {
        const callId = part.toolCallId;
        const { state, input, output } = part;
        const isExpanded = expandedTools[callId] ?? true;

        return (
            <div
                key={callId}
                className="p-4 my-2 text-gray-500 border border-gray-300 rounded"
            >
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="text-xs">Tool: display_excalidraw</div>
                        {input && Object.keys(input).length > 0 && (
                            <button
                                onClick={() =>
                                    setExpandedTools((prev) => ({
                                        ...prev,
                                        [callId]: !isExpanded,
                                    }))
                                }
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                {isExpanded ? "Hide Args" : "Show Args"}
                            </button>
                        )}
                    </div>
                    {input && isExpanded && (
                        <div className="mt-1 font-mono text-xs overflow-hidden">
                            {typeof input === "object" &&
                                Object.keys(input).length > 0 &&
                                `Input: ${JSON.stringify(input, null, 2)}`}
                        </div>
                    )}
                    <div className="mt-2 text-sm">
                        {state === "input-streaming" ? (
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : state === "output-available" ? (
                            <div className="text-green-600">
                                {output || "Canvas updated"}
                            </div>
                        ) : state === "output-error" ? (
                            <div className="text-red-600">
                                {output || "Tool failed"}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ScrollArea className="h-full pr-4">
            {messages.length === 0 ? (
                <ExamplePanel setInput={setInput} setFiles={setFiles} />
            ) : (
                messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 ${
                            message.role === "user" ? "text-right" : "text-left"
                        }`}
                    >
                        <div
                            className={`inline-block px-4 py-2 whitespace-pre-wrap text-sm rounded-lg max-w-[85%] break-words ${
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {message.parts?.map((part: any, index: number) => {
                                switch (part.type) {
                                    case "text":
                                        return (
                                            <div key={index}>{part.text}</div>
                                        );
                                    case "file":
                                        return (
                                            <div key={index} className="mt-2">
                                                <Image
                                                    src={part.url}
                                                    width={200}
                                                    height={200}
                                                    alt={`file-${index}`}
                                                    className="rounded-md border"
                                                    style={{
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            </div>
                                        );
                                    default:
                                        if (part.type?.startsWith("tool-")) {
                                            return renderToolPart(part);
                                        }
                                        return null;
                                }
                            })}
                        </div>
                    </div>
                ))
            )}
            {error && (
                <div className="text-red-500 text-sm mt-2">
                    Error: {error.message}
                </div>
            )}
            <div ref={messagesEndRef} />
        </ScrollArea>
    );
}
