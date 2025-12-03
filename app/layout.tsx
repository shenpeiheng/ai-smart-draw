import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { DiagramProvider } from "@/contexts/diagram-context";
import { ModelConfigProvider } from "@/contexts/model-config-context";
import { KrokiProvider } from "@/contexts/kroki-context";
import "@excalidraw/excalidraw/index.css";

import "./globals.css";

export const metadata: Metadata = {
    title: "AI Smart Draw",
    description: "An AI-powered drawing tool that integrates with draw.io, Mermaid, PlantUML, Excalidraw and more",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <DiagramProvider>
                    <ModelConfigProvider>
                        <KrokiProvider>{children}</KrokiProvider>
                    </ModelConfigProvider>
                </DiagramProvider>

                <Analytics />
            </body>
        </html>
    );
}
