"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const DEFAULT_SCENE = JSON.stringify(
    {
        "elements": [
            {
                "id": "node-1",
                "type": "rectangle",
                "x": 200,
                "y": 160,
                "width": 180,
                "height": 80,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#e3f2fd",
                "fillStyle": "solid",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12345,
                "version": 3,
                "versionNonce": 264493612,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "用户",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "a0"
            },
            {
                "id": "node-1-label",
                "type": "text",
                "x": 267.6,
                "y": 183.2,
                "width": 44.8,
                "height": 33.599999999999994,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 560830857,
                "version": 2,
                "versionNonce": 580857492,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "用户",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 24,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "a1"
            },
            {
                "id": "node-2",
                "type": "rectangle",
                "x": 450,
                "y": 160,
                "width": 180,
                "height": 80,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#f3e5f5",
                "fillStyle": "solid",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12346,
                "version": 3,
                "versionNonce": 1025488044,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "角色",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "a2"
            },
            {
                "id": "node-2-label",
                "type": "text",
                "x": 517.6,
                "y": 183.2,
                "width": 44.8,
                "height": 33.599999999999994,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 609858348,
                "version": 2,
                "versionNonce": 1835285524,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "角色",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 24,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "a3"
            },
            {
                "id": "node-3",
                "type": "rectangle",
                "x": 700,
                "y": 160,
                "width": 180,
                "height": 80,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#e8f5e8",
                "fillStyle": "solid",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12347,
                "version": 3,
                "versionNonce": 924598060,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "权限",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "a4"
            },
            {
                "id": "node-3-label",
                "type": "text",
                "x": 767.6,
                "y": 183.2,
                "width": 44.8,
                "height": 33.599999999999994,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 817879002,
                "version": 2,
                "versionNonce": 120297876,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "权限",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 24,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "a5"
            },
            {
                "id": "node-4",
                "type": "rectangle",
                "x": 950,
                "y": 160,
                "width": 180,
                "height": 80,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#fff3e0",
                "fillStyle": "solid",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12348,
                "version": 3,
                "versionNonce": 102988204,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "资源",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "a6"
            },
            {
                "id": "node-4-label",
                "type": "text",
                "x": 1017.6,
                "y": 183.2,
                "width": 44.8,
                "height": 33.599999999999994,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 340073973,
                "version": 2,
                "versionNonce": 2066433812,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "资源",
                "fontSize": 24,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 24,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "a7"
            },
            {
                "id": "connector-1",
                "type": "arrow",
                "x": 380,
                "y": 200,
                "width": 70,
                "height": 1,
                "angle": 0,
                "strokeColor": "#666666",
                "backgroundColor": "transparent",
                "fillStyle": "hachure",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 2
                },
                "seed": 12349,
                "version": 3,
                "versionNonce": 358573100,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "",
                "fontSize": 20,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "points": [
                    [
                        0,
                        0
                    ],
                    [
                        70,
                        0
                    ]
                ],
                "startBinding": {
                    "elementId": "node-1",
                    "focus": 0,
                    "gap": 1
                },
                "endBinding": {
                    "elementId": "node-2",
                    "focus": 0,
                    "gap": 1
                },
                "index": "a8"
            },
            {
                "id": "connector-2",
                "type": "arrow",
                "x": 630,
                "y": 200,
                "width": 70,
                "height": 1,
                "angle": 0,
                "strokeColor": "#666666",
                "backgroundColor": "transparent",
                "fillStyle": "hachure",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 2
                },
                "seed": 12350,
                "version": 3,
                "versionNonce": 2111390868,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "",
                "fontSize": 20,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "points": [
                    [
                        0,
                        0
                    ],
                    [
                        70,
                        0
                    ]
                ],
                "startBinding": {
                    "elementId": "node-2",
                    "focus": 0,
                    "gap": 1
                },
                "endBinding": {
                    "elementId": "node-3",
                    "focus": 0,
                    "gap": 1
                },
                "index": "a9"
            },
            {
                "id": "connector-3",
                "type": "arrow",
                "x": 880,
                "y": 200,
                "width": 70,
                "height": 1,
                "angle": 0,
                "strokeColor": "#666666",
                "backgroundColor": "transparent",
                "fillStyle": "hachure",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 2
                },
                "seed": 12351,
                "version": 3,
                "versionNonce": 1522138796,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "",
                "fontSize": 20,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "points": [
                    [
                        0,
                        0
                    ],
                    [
                        70,
                        0
                    ]
                ],
                "startBinding": {
                    "elementId": "node-3",
                    "focus": 0,
                    "gap": 1
                },
                "endBinding": {
                    "elementId": "node-4",
                    "focus": 0,
                    "gap": 1
                },
                "index": "aA"
            },
            {
                "id": "title",
                "type": "text",
                "x": 500,
                "y": 50,
                "width": 300,
                "height": 40,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "transparent",
                "fillStyle": "hachure",
                "strokeWidth": 2,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 12352,
                "version": 3,
                "versionNonce": 1156289044,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "用户权限设计图",
                "fontSize": 32,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "aB"
            },
            {
                "id": "legend-1",
                "type": "rectangle",
                "x": 200,
                "y": 300,
                "width": 180,
                "height": 40,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#e3f2fd",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12353,
                "version": 3,
                "versionNonce": 2128431404,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "用户管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "aC"
            },
            {
                "id": "legend-1-label",
                "type": "text",
                "x": 262.8,
                "y": 308.8,
                "width": 54.4,
                "height": 22.4,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 178788659,
                "version": 2,
                "versionNonce": 1599614868,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "用户管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 16,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "aD"
            },
            {
                "id": "legend-2",
                "type": "rectangle",
                "x": 450,
                "y": 300,
                "width": 180,
                "height": 40,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#f3e5f5",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12354,
                "version": 3,
                "versionNonce": 87245740,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "角色管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "aE"
            },
            {
                "id": "legend-2-label",
                "type": "text",
                "x": 512.8,
                "y": 308.8,
                "width": 54.4,
                "height": 22.4,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 805967326,
                "version": 2,
                "versionNonce": 223681812,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "角色管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 16,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "aF"
            },
            {
                "id": "legend-3",
                "type": "rectangle",
                "x": 700,
                "y": 300,
                "width": 180,
                "height": 40,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#e8f5e8",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12355,
                "version": 3,
                "versionNonce": 1944448556,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "权限管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "aG"
            },
            {
                "id": "legend-3-label",
                "type": "text",
                "x": 762.8,
                "y": 308.8,
                "width": 54.4,
                "height": 22.4,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 809118704,
                "version": 2,
                "versionNonce": 408443540,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "权限管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 16,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "aH"
            },
            {
                "id": "legend-4",
                "type": "rectangle",
                "x": 950,
                "y": 300,
                "width": 180,
                "height": 40,
                "angle": 0,
                "strokeColor": "#1e1e1e",
                "backgroundColor": "#fff3e0",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 1,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": {
                    "type": 3
                },
                "seed": 12356,
                "version": 3,
                "versionNonce": 2078230700,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "资源管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 0,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "startBinding": null,
                "endBinding": null,
                "index": "aI"
            },
            {
                "id": "legend-4-label",
                "type": "text",
                "x": 1012.8,
                "y": 308.8,
                "width": 54.4,
                "height": 22.4,
                "angle": 0,
                "strokeColor": "#000000",
                "backgroundColor": "transparent",
                "fillStyle": "solid",
                "strokeWidth": 1,
                "roughness": 0,
                "opacity": 100,
                "strokeStyle": "solid",
                "roundness": null,
                "seed": 217512520,
                "version": 2,
                "versionNonce": 722987028,
                "isDeleted": false,
                "groupIds": [],
                "frameId": null,
                "boundElements": [],
                "text": "资源管理",
                "fontSize": 16,
                "fontFamily": 1,
                "textAlign": "center",
                "verticalAlign": "middle",
                "baseline": 16,
                "lineHeight": 1.25,
                "link": null,
                "locked": false,
                "updated": 1763372198138,
                "index": "aJ"
            }
        ],
        "appState": {
            "showWelcomeScreen": false,
            "theme": "light",
            "currentChartType": "bar",
            "currentItemBackgroundColor": "transparent",
            "currentItemEndArrowhead": "arrow",
            "currentItemFillStyle": "solid",
            "currentItemFontFamily": 1,
            "currentItemFontSize": 20,
            "currentItemOpacity": 100,
            "currentItemRoughness": 1,
            "currentItemStartArrowhead": null,
            "currentItemStrokeColor": "#1e1e1e",
            "currentItemRoundness": "round",
            "currentItemArrowType": "round",
            "currentItemStrokeStyle": "solid",
            "currentItemStrokeWidth": 2,
            "currentItemTextAlign": "left",
            "currentHoveredFontFamily": null,
            "cursorButton": "up",
            "activeEmbeddable": null,
            "newElement": null,
            "editingTextElement": null,
            "editingGroupId": null,
            "editingLinearElement": null,
            "activeTool": {
                "type": "selection",
                "customType": null,
                "locked": false,
                "lastActiveTool": null
            },
            "penMode": false,
            "penDetected": false,
            "errorMessage": null,
            "exportBackground": true,
            "exportScale": 1,
            "exportEmbedScene": false,
            "exportWithDarkMode": false,
            "fileHandle": null,
            "gridSize": 20,
            "gridStep": 5,
            "gridModeEnabled": false,
            "isBindingEnabled": true,
            "defaultSidebarDockedPreference": false,
            "isLoading": false,
            "isResizing": false,
            "isRotating": false,
            "lastPointerDownWith": "mouse",
            "multiElement": null,
            "name": "Untitled-2025-11-17-1734",
            "contextMenu": null,
            "openMenu": null,
            "openPopup": null,
            "openSidebar": null,
            "openDialog": null,
            "pasteDialog": {
                "shown": false,
                "data": null
            },
            "previousSelectedElementIds": {},
            "resizingElement": null,
            "scrolledOutside": false,
            "scrollX": 0,
            "scrollY": 100,
            "selectedElementIds": {},
            "hoveredElementIds": {},
            "selectedGroupIds": {},
            "selectedElementsAreBeingDragged": false,
            "selectionElement": null,
            "shouldCacheIgnoreZoom": false,
            "stats": {
                "open": false,
                "panels": 3
            },
            "startBoundElement": null,
            "suggestedBindings": [],
            "frameRendering": {
                "enabled": true,
                "clip": true,
                "name": true,
                "outline": true
            },
            "frameToHighlight": null,
            "editingFrame": null,
            "elementsToHighlight": null,
            "toast": null,
            "viewBackgroundColor": "#ffffff",
            "zenModeEnabled": false,
            "zoom": {
                "value": 1
            },
            "viewModeEnabled": false,
            "pendingImageElementId": null,
            "showHyperlinkPopup": false,
            "selectedLinearElement": null,
            "snapLines": [],
            "originSnapOffset": {
                "x": 0,
                "y": 0
            },
            "objectsSnapModeEnabled": false,
            "userToFollow": null,
            "followedBy": {},
            "isCropping": false,
            "croppingElementId": null,
            "searchMatches": [],
            "offsetLeft": 17,
            "offsetTop": 17,
            "width": 1246,
            "height": 687
        },
        "files": {}
    },
    null,
    2
);

type NormalizedScene = {
    elements: any[];
    appState: Record<string, any>;
    files: Record<string, any>;
};

type NormalizedSceneInput = Partial<NormalizedScene> | null | undefined;

interface SceneSnapshot {
    id: string;
    summary?: string;
    createdAt: number;
    scene: string;
}

interface ExcalidrawContextValue {
    sceneData: string;
    sceneDraft: string | null;
    setSceneDraft: (json: string | null) => void;
    history: SceneSnapshot[];
    excalidrawAPIRef: React.MutableRefObject<ExcalidrawImperativeAPI | null>;
    recordScene: (
        elements: any[],
        appState: Record<string, any>,
        files: Record<string, any>
    ) => void;
    applyScene: (
        scene: string | NormalizedSceneInput,
        summary?: string,
        options?: { skipHistory?: boolean; replaceHistory?: boolean }
    ) => void;
    clearScene: () => void;
}

const ExcalidrawContext = createContext<ExcalidrawContextValue | undefined>(
    undefined
);

function createSnapshot(scene: string, summary?: string): SceneSnapshot {
    const id =
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
        id,
        summary,
        createdAt: Date.now(),
        scene,
    };
}

function safeColor(val: any, fallback: string) {
    return typeof val === "string" && val.trim().startsWith("#") ? val.trim() : fallback;
}

function clampFontFamily(val: any) {
    const allowed = [1, 2, 3];
    return allowed.includes(val) ? val : 1;
}

function normalizeScene(input: NormalizedSceneInput): NormalizedScene {
    const parsed = input ?? {};
    const defaultAppState = {
        viewBackgroundColor: "#ffffff",
        currentItemStrokeColor: "#1e1e1e",
        currentItemBackgroundColor: "transparent",
        currentItemFillStyle: "solid",
        currentItemStrokeWidth: 2,
        currentItemRoughness: 0,
        currentItemOpacity: 100,
        currentItemFontFamily: 1,
        currentItemFontSize: 20,
        currentItemTextAlign: "center",
        currentItemStrokeStyle: "solid",
        currentItemRoundness: null,
        gridSize: null,
        theme: "light",
        scrollX: 0,
        scrollY: 0,
        zoom: { value: 1 },
    };

    const elements = Array.isArray(parsed?.elements) ? parsed.elements : [];
    const normalizedElements: any[] = [];

    elements.forEach((el: any, idx: number) => {
        const fallbackId = `el-${idx}-${Date.now()}`;
        const isLinear = ["line", "arrow", "freedraw", "draw"].includes(el?.type);
        let points: any[] | undefined = el?.points;
        if (isLinear) {
            if (!Array.isArray(points) || points.length < 2) {
                const w = Number.isFinite(el?.width) ? Math.max(el.width, 40) : 100;
                points = [
                    [0, 0],
                    [w, 0],
                ];
            }
        } else {
            points = undefined;
        }

        const base = {
            id: el?.id || fallbackId,
            type: el?.type || "rectangle",
            x: Number.isFinite(el?.x) ? el.x : idx * 60,
            y: Number.isFinite(el?.y) ? el.y : idx * 40,
            width: Number.isFinite(el?.width) ? Math.max(el.width, 1) : 120,
            height: Number.isFinite(el?.height) ? Math.max(el.height, 1) : 60,
            angle: Number.isFinite(el?.angle) ? el.angle : 0,
            strokeColor: safeColor(el?.strokeColor, "#1e1e1e"),
            backgroundColor: safeColor(el?.backgroundColor, "transparent"),
            fillStyle: el?.fillStyle || "solid",
            strokeWidth: Number.isFinite(el?.strokeWidth) ? el.strokeWidth : 2,
            roughness: Number.isFinite(el?.roughness) ? el.roughness : 0,
            opacity: Number.isFinite(el?.opacity) ? el.opacity : 100,
            strokeStyle: el?.strokeStyle || "solid",
            roundness: el?.roundness ?? null,
            seed: Number.isFinite(el?.seed) ? el.seed : Math.floor(Math.random() * 1e9),
            version: Number.isFinite(el?.version) ? el.version : 1,
            versionNonce: Number.isFinite(el?.versionNonce) ? el.versionNonce : Math.floor(Math.random() * 1e9),
            isDeleted: !!el?.isDeleted,
            groupIds: Array.isArray(el?.groupIds) ? el.groupIds : [],
            frameId: el?.frameId ?? null,
            boundElements: Array.isArray(el?.boundElements) ? el.boundElements : [],
            text: typeof el?.text === "string" ? el.text : "",
            fontSize: Number.isFinite(el?.fontSize) ? el.fontSize : 20,
            fontFamily: clampFontFamily(el?.fontFamily),
            textAlign: el?.textAlign || "center",
            verticalAlign: el?.verticalAlign || "middle",
            baseline: Number.isFinite(el?.baseline) ? el.baseline : 0,
            lineHeight: Number.isFinite(el?.lineHeight) ? el.lineHeight : 1.25,
            link: typeof el?.link === "string" ? el.link : null,
            locked: !!el?.locked,
            updated: Number.isFinite(el?.updated) ? el.updated : Date.now(),
            points,
            startBinding: isLinear && el?.startBinding ? el.startBinding : null,
            endBinding: isLinear && el?.endBinding ? el.endBinding : null,
        };

        normalizedElements.push(base);

        // If shape carries text but isn't a text element, add a sibling text label
        if (base.type !== "text" && base.text) {
            const padding = 8;
            const estWidth = Math.max(base.text.length * (base.fontSize * 0.6) + padding * 2, 40);
            const estHeight = Math.max(base.fontSize * 1.4, 20);
            const cx = base.x + base.width / 2;
            const cy = base.y + base.height / 2;
            normalizedElements.push({
                id: `${base.id}-label`,
                type: "text",
                x: cx - estWidth / 2,
                y: cy - estHeight / 2,
                width: estWidth,
                height: estHeight,
                angle: 0,
                strokeColor: "#000000",
                backgroundColor: "transparent",
                fillStyle: "solid",
                strokeWidth: 1,
                roughness: 0,
                opacity: 100,
                strokeStyle: "solid",
                roundness: null,
                seed: Math.floor(Math.random() * 1e9),
                version: 1,
                versionNonce: Math.floor(Math.random() * 1e9),
                isDeleted: false,
                groupIds: [],
                frameId: null,
                boundElements: [],
                text: base.text,
                fontSize: base.fontSize,
                fontFamily: base.fontFamily,
                textAlign: "center",
                verticalAlign: "middle",
                baseline: Math.round(base.fontSize),
                lineHeight: base.lineHeight,
                link: null,
                locked: false,
                updated: Date.now(),
            });
        }
    });

    const appStateRaw = parsed?.appState || {};
    const appState = {
        ...defaultAppState,
        currentItemFontFamily: clampFontFamily(appStateRaw.currentItemFontFamily),
        currentItemStrokeColor: safeColor(appStateRaw.currentItemStrokeColor, "#1e1e1e"),
        currentItemBackgroundColor: safeColor(appStateRaw.currentItemBackgroundColor, "transparent"),
        currentItemTextAlign: ["left", "right", "center", "start", "end"].includes(appStateRaw.currentItemTextAlign)
            ? appStateRaw.currentItemTextAlign
            : "center",
        currentItemFillStyle: appStateRaw.currentItemFillStyle || defaultAppState.currentItemFillStyle,
        currentItemStrokeStyle: appStateRaw.currentItemStrokeStyle || defaultAppState.currentItemStrokeStyle,
        currentItemRoundness:
            appStateRaw.currentItemRoundness !== undefined
                ? appStateRaw.currentItemRoundness
                : defaultAppState.currentItemRoundness,
        currentItemStrokeWidth: Number.isFinite(appStateRaw.currentItemStrokeWidth)
            ? appStateRaw.currentItemStrokeWidth
            : defaultAppState.currentItemStrokeWidth,
        currentItemRoughness: Number.isFinite(appStateRaw.currentItemRoughness)
            ? appStateRaw.currentItemRoughness
            : defaultAppState.currentItemRoughness,
        currentItemOpacity: Number.isFinite(appStateRaw.currentItemOpacity)
            ? appStateRaw.currentItemOpacity
            : defaultAppState.currentItemOpacity,
        currentItemFontSize: Number.isFinite(appStateRaw.currentItemFontSize)
            ? appStateRaw.currentItemFontSize
            : defaultAppState.currentItemFontSize,
        gridSize: appStateRaw.gridSize ?? defaultAppState.gridSize,
        theme: appStateRaw.theme || defaultAppState.theme,
        scrollX: Number.isFinite(appStateRaw.scrollX) ? appStateRaw.scrollX : 0,
        scrollY: Number.isFinite(appStateRaw.scrollY) ? appStateRaw.scrollY : 0,
        zoom:
            appStateRaw.zoom && Number.isFinite(appStateRaw.zoom.value)
                ? appStateRaw.zoom
                : { value: 1 },
        viewBackgroundColor: safeColor(appStateRaw.viewBackgroundColor, "#ffffff"),
    };
    /*if (appState.collaborators) {
        delete appState.collaborators;
    }*/

    const files =
        parsed?.files && typeof parsed.files === "object" ? parsed.files : {};

    return {
        elements: normalizedElements,
        appState,
        files,
    };
}

function coerceSceneInput(scene: string | NormalizedSceneInput): NormalizedScene {
    if (typeof scene === "string") {
        return normalizeScene(JSON.parse(scene));
    }
    return normalizeScene(scene);
}

function stringifyScene(scene: NormalizedScene) {
    return JSON.stringify(scene, null, 2);
}

export function ExcalidrawProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sceneData, setSceneData] = useState<string>(DEFAULT_SCENE);
    const [sceneDraft, setSceneDraft] = useState<string | null>(null);
    const [history, setHistory] = useState<SceneSnapshot[]>(() => [
        createSnapshot(DEFAULT_SCENE, "Initial canvas"),
    ]);
    const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);

    const recordScene = useCallback(
        (
            elements: any[],
            appState: Record<string, any>,
            files: Record<string, any>
        ) => {
            try {
                // Excalidraw expects collaborators as Map; strip it to avoid serialization issues
                const { collaborators, ...restAppState } = appState || {};
                const payload = JSON.stringify(
                    { elements, appState: restAppState, files },
                    null,
                    2
                );
                setSceneData(payload);
            } catch (error) {
                console.error("Failed to serialize Excalidraw scene", error);
            }
        },
        []
    );

    const applyScene = useCallback(
        (
            scene: string | NormalizedSceneInput,
            summary?: string,
            options?: { skipHistory?: boolean; replaceHistory?: boolean }
        ) => {
            try {
                const normalized = coerceSceneInput(scene);
                excalidrawAPIRef.current?.updateScene(normalized);
                const normalizedString = stringifyScene(normalized);
                setSceneData(normalizedString);
                setSceneDraft(null);
                if (!options?.skipHistory) {
                    setHistory((prev) => {
                        const next = [
                            ...(options?.replaceHistory ? prev.slice(0, -1) : prev),
                            createSnapshot(normalizedString, summary),
                        ];
                        return next;
                    });
                }
            } catch (error) {
                console.error("Invalid Excalidraw scene from AI:", error);
            }
        },
        []
    );

    const clearScene = useCallback(() => {
        try {
            const parsed = JSON.parse(DEFAULT_SCENE);
            excalidrawAPIRef.current?.updateScene(parsed);
        } catch {
            // ignore parse errors on the known default
        }
        setSceneData(DEFAULT_SCENE);
        setSceneDraft(null);
        setHistory([createSnapshot(DEFAULT_SCENE, "Canvas reset")]);
    }, []);

    const value = useMemo(
        () => ({
            sceneData,
            sceneDraft,
            setSceneDraft,
            history,
            excalidrawAPIRef,
            recordScene,
            applyScene,
            clearScene,
        }),
        [sceneData, sceneDraft, history, recordScene, applyScene, clearScene]
    );

    return (
        <ExcalidrawContext.Provider value={value}>
            {children}
        </ExcalidrawContext.Provider>
    );
}

export function useExcalidraw() {
    const context = useContext(ExcalidrawContext);
    if (!context) {
        throw new Error("useExcalidraw must be used within ExcalidrawProvider");
    }
    return context;
}
