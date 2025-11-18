"use client";

import { MermaidPreview } from "@/components/mermaid-preview";
import { MermaidDefinitionCard } from "@/components/mermaid-definition-card";
import { useMermaid } from "@/contexts/mermaid-context";

export function MermaidWorkspace() {
    const { definition, clearDefinition, setDefinition } = useMermaid();

    return (
        <div className="flex flex-col h-full gap-1">
            <div className="flex-1 min-h-0">
                <MermaidPreview
                    definition={definition}
                    className="h-full"
                />
            </div>
            <div className="h-52">
                <MermaidDefinitionCard
                    definition={definition}
                    onDefinitionChange={setDefinition}
                    onReset={clearDefinition}
                />
            </div>
        </div>
    );
}
