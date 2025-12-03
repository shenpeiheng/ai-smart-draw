# AI Smart Draw

English | [中文](README.md)

An intelligent diagramming application built with Next.js that harnesses the power of AI to create and manipulate various types of diagrams including Draw.io (diagrams.net), Mermaid, PlantUML, Excalidraw, and over 20 other diagram formats through natural language commands.

🔗 **Live Demo**:
- https://ai-smart-draw.vercel.app/

![de5e647f-a83a-4b28-bd56-b449f587e472.png](public/de5e647f-a83a-4b28-bd56-b449f587e472.png)
![01669c29-60a7-4777-af14-0982d6c6daa8.png](public/01669c29-60a7-4777-af14-0982d6c6daa8.png)
![409fd263-800f-4183-8df9-71691307633c.png](public/409fd263-800f-4183-8df9-71691307633c.png)
![6dd5b5c1-1e25-4d33-a45f-d10eb0fbb804.png](public/6dd5b5c1-1e25-4d33-a45f-d10eb0fbb804.png)
![7736141c-e820-450d-8260-5f5b0c846388.png](public/7736141c-e820-450d-8260-5f5b0c846388.png)
![e59f7980-ac2f-4c57-b9a7-8b7c75feed58.png](public/e59f7980-ac2f-4c57-b9a7-8b7c75feed58.png)

## 🌟 Key Features

- **AI-Powered Diagram Creation**: Transform natural language descriptions into professional diagrams
- **Multi-Format Support**: Work with Draw.io XML, Mermaid, PlantUML, Excalidraw, and 20+ other formats via Kroki
- **Intelligent Editing**: Modify existing diagrams through conversational AI prompts
- **Real-time Preview**: See changes as you interact with the AI
- **Version History**: Track and restore previous versions of your diagrams
- **Collapsible Chat Panel**: Expand or collapse the chat interface to maximize workspace
- **Flexible Rendering**: Multiple rendering options with fallback mechanisms
- **Model Configuration**: Customize AI models directly from the browser

## 🎯 Supported Diagram Types

### Draw.io (diagrams.net)
Create and edit professional flowcharts, process diagrams, and complex visualizations using AI-powered XML generation and modification.

### Mermaid
Generate flowcharts, sequence diagrams, Gantt charts, and more with live SVG previews in a dedicated workspace.

### PlantUML
Create UML diagrams with a built-in rendering proxy that supports plantuml.com, kroki.io, or custom endpoints.

### Excalidraw
Freehand-style sketching combined with AI assistance for organic diagram creation.

### Kroki (20+ Formats)
Generate diagrams in various formats using the kroki.io service with a single interface. Supports:

- **PlantUML**: UML diagrams, activity diagrams, sequence diagrams, etc.
- **Mermaid**: Flowcharts, sequence diagrams, Gantt charts, etc.
- **BPMN**: Business Process Modeling Notation for workflow diagrams
- **Graphviz**: Graph visualization and network diagrams
- **BlockDiag**: Block diagrams
- **C4-PlantUML**: Software architecture diagrams
- **Ditaa**: ASCII art to image conversion
- **Erd**: Entity relationship diagrams
- **Vega/Vega-Lite**: Data visualizations
- **And 15+ more formats**

## 🛠 How It Works

AI Smart Draw leverages modern web technologies to bridge natural language and diagrammatic representations:

- **Next.js App Router**: Fast, modern React framework with server-side rendering
- **AI SDK Integration**: Seamless communication with OpenAI-compatible APIs
- **Context-Aware Prompts**: Intelligent prompt engineering for each diagram type
- **Real-time Streaming**: Instant feedback with streaming responses
- **Format-Specific Tools**: Dedicated tools for each diagram format (`display_mermaid`, `display_plantuml`, etc.)

The application converts your natural language requests into structured diagram code, which is then rendered in real-time.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shenpeiheng/ai-smart-draw.git
cd ai-smart-draw
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory. You can use `env.example` as a template:
```bash
cp env.example .env.local
```

Then update `.env.local` with your OpenAI credentials.

### OpenAI Configuration

- `OPENAI_API_KEY` (required): Secret key from your OpenAI account.
- `OPENAI_MODEL` (optional): Defaults to `gpt-4o-mini`, override if you prefer another released variant.
- `OPENAI_BASE_URL` (optional): Defaults to `https://api.openai.com/v1`; set this if you are self-hosting a proxy or gateway.

Example snippet:
```bash
OPENAI_API_KEY="sk-your-key"
# OPENAI_MODEL="gpt-4o-mini"
# OPENAI_BASE_URL="https://api.openai.com/v1"
```

#### Optional: Configure from the browser

- Click the **模型设置** button in any workspace header to override API Key, Base URL, or model for the current browser. Values are stored in `localStorage` and only sent to the server when you submit a chat request.
- Leave any field blank to fall back to the server-side environment variables described above.
- Use the **拉取列表** button to call the `/api/models` helper, which forwards the current credentials to `GET /models` and lists selectable model IDs.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
    - `/` -> Draw.io (XML workflows, diagram history, file upload)
    - `/mermaid` -> Mermaid (live preview + definition card powered by your configured OpenAI-compatible model)
    - `/plantuml` -> PlantUML (text-based diagrams with remote preview)
    - `/excalidraw` -> Excalidraw (freeform canvas powered by the same model)
    - `/kroki` -> Kroki (multi-format diagrams powered by kroki.io)
    - `/graphviz` -> Graphviz (graph visualization diagrams powered by kroki.io)

## 🌐 User Interface Features

### Collapsible Chat Panel
- Toggle the chat panel to maximize your workspace
- When collapsed, a floating button provides quick access to restore the chat panel
- Smooth animations for a seamless user experience

### Responsive Design
- Optimized for desktop and laptop usage
- Mobile-friendly interface with appropriate messaging

### Unified Navigation
- Easy switching between different diagram types
- Consistent interface across all diagram workspaces

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Or you can deploy by this button.
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshenpeiheng%2Fai-smart-draw)

### Cloudflare Pages
- Build command: `npm run cf:build`
- Output directory: `.vercel/output/static` (functions located at `.vercel/output/functions`, automatically recognized by Pages)
- Local preview: `npm run cf:preview` (loads `.dev.vars`)
- Deploy: `npm run cf:deploy` (requires creating a Pages project on Cloudflare first and configuring environment variables with the same name)
- Existing Vercel processes remain unchanged.

## 📁 Project Structure

```
app/                  # Next.js application routes and pages
  api/                # API routes for different diagram types
  [diagram-type]/     # Individual pages for each diagram type
components/           # React components
  ui/                 # Reusable UI components
  [feature]/          # Feature-specific components
contexts/             # React context providers
lib/                  # Utility functions and helpers
public/               # Static assets including example images
```

## ✅ TODOs

- [x] Allow the LLM to modify the XML instead of generating it from scratch everytime.
- [x] Improve the smoothness of shape streaming updates.
- [x] Add collapsible chat panel for better workspace utilization.

## 📄 License

This project is licensed under the MIT License.

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=shenpeiheng/ai-smart-draw&type=date&legend=top-left)](https://www.star-history.com/#shenpeiheng/ai-smart-draw&type=date&legend=top-left)
