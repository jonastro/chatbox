# AI Chatbot - Powered by Ollama

A modern AI chatbot application built with Next.js and powered by Ollama for local AI inference.

## Prerequisites

Before running this application, make sure you have [Ollama](https://ollama.ai/) installed and running locally:

1. Install Ollama from [https://ollama.ai/](https://ollama.ai/)
2. Pull a model (e.g., `ollama pull llama3.2`)
3. Start Ollama service (usually runs on `http://localhost:11434`)

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start chatting with AI.

## Features

- 🤖 **Local AI Chat** powered by Ollama
- ⚡ **Next.js 14** with App Router
- 💅 **Styled Components** for modern styling
- 📝 **TypeScript** for type safety
- 🧹 **ESLint** for code linting
- 🎨 **Beautiful UI** with glassmorphism design
- 📱 **Responsive design** for all devices
- 🔄 **Real-time streaming** chat interface
- 🧠 **Conversation context** maintained throughout the session
- 🗑️ **Clear conversation** to start fresh
- ⚡ **Streaming responses** with Server-Sent Events (SSE)
- 💭 **Live typing indicators** during AI response generation
- 🧠 **Thinking process display** for reasoning models (DeepSeek-R1)
- 🔍 **Expandable thinking sections** to see AI's reasoning steps
- 📐 **LaTeX math rendering** with KaTeX (supports `\[...\]` and `$...$`)
- 🧮 **Real-time math display** during streaming responses
- 📝 **Markdown support** for formatted text (**bold**, *italic*, lists, headers, code)
- 🎨 **Mixed content rendering** seamlessly combines Markdown, LaTeX, and thinking content
- 🎯 **Model selector** with auto-discovery of available Ollama models
- 🔄 **Dynamic model switching** without restarting the application
- 🚀 **Fast local inference** with progressive text display

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── stream/
│   │   │       └── route.ts # Streaming API endpoint
│   │   └── models/
│   │       └── route.ts     # Models API endpoint
│   ├── chat/
│   │   └── components/
│   │       └── ContentRenderer.tsx      # Markdown & Math content renderer
│   ├── components/
│   │   └── StyledComponentsRegistry.tsx  # Styled components setup
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Chat interface
├── lib/
│   ├── content-parser.ts    # Combined Markdown & LaTeX parsing utilities
│   ├── math.ts              # LaTeX math parsing utilities (legacy)
│   └── ollama.ts            # Ollama client utilities (with streaming & models)
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
├── README.md               # This file
└── tsconfig.json           # TypeScript configuration
```

## Configuration

You can modify the AI model in `lib/ollama.ts`:

```typescript
// Change this to any model you have installed via Ollama
model: 'deepseek-r1:latest'  // or 'llama3.2', 'llama2', 'codellama', etc.
```

### DeepSeek-R1 Reasoning Display

This chatbot has special support for **DeepSeek-R1** and other reasoning models that include thinking processes:

- **Thinking Tags**: Content between `<think>` and `</think>` tags is parsed as reasoning
- **Separate Display**: Thinking content is shown in a styled, collapsible section
- **State Machine**: Handles split tags across streaming chunks correctly
- **Toggle View**: Users can expand/collapse thinking sections per message

### LaTeX Math Rendering

Full support for mathematical expressions with **KaTeX**:

- **Display Math**: `\[equation\]` renders as centered block equations
- **Inline Math**: `$equation$` renders inline within text
- **Real-time Rendering**: Math appears as it streams from the AI
- **Mixed Content**: Text, thinking, and math all rendered together
- **Error Handling**: Graceful fallback for invalid LaTeX syntax

**Example formats supported**:
```latex
\[S_{n+1} = \frac{n(n+1)}{2} + \frac{2(n+1)}{2}\]  # Display math
The equation $E = mc^2$ is famous.                    # Inline math
```

### Markdown Text Formatting

Full **Markdown syntax** support with styled rendering:

- **Headers**: `# Header 1`, `## Header 2`, etc.
- **Bold Text**: `**bold**` renders as **bold**
- **Italic Text**: `*italic*` renders as *italic*
- **Lists**: Both `* bullet` and `1. numbered` lists
- **Code**: `inline code` and ```code blocks```
- **Links**: `[text](url)` with hover effects
- **Blockquotes**: `> quoted text` with left border styling

**Smart Content Detection**: The parser automatically detects whether text contains Markdown syntax and applies appropriate rendering, while preserving plain text for simple messages.

### Model Selection

Dynamic model switching with **Ollama integration**:

- **Auto-Discovery**: Automatically detects all available Ollama models
- **Live Switching**: Change models without restarting the application
- **Model Refresh**: Update model list with new installations
- **Smart Defaults**: Automatically selects best available model
- **Model Display**: Friendly formatting of model names in the UI

**Usage**:
1. Install models via Ollama: `ollama pull llama3.2`
2. Refresh models in the UI using the 🔄 button
3. Select any model from the dropdown
4. Start chatting with the new model immediately

## Architecture

This application uses **streaming responses** for real-time chat experience:

- **Streaming API**: `/api/chat/stream` endpoint with Server-Sent Events (SSE)
- **Progressive Display**: Text appears as it's generated by Ollama
- **Live Indicators**: Visual feedback during response generation
- **Context Preservation**: Full conversation history maintained
- **Error Handling**: Graceful fallbacks for connection issues

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. 