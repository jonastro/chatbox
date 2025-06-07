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
- 🔄 **Real-time chat** interface
- 🧠 **Conversation context** maintained throughout the session
- 🗑️ **Clear conversation** to start fresh
- ⚡ **Server Actions** for direct server-side Ollama calls (no API routes)
- 🚀 **Fast local inference** with minimal overhead

## Project Structure

```
├── app/
│   ├── components/
│   │   └── StyledComponentsRegistry.tsx  # Styled components setup
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Chat interface
├── lib/
│   ├── actions.ts           # Server Actions for chat
│   └── ollama.ts            # Ollama client utilities
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
model: 'llama3.2'  // or 'llama2', 'codellama', etc.
```

## Architecture

This application uses **Next.js Server Actions** instead of API routes for better performance:

- **Direct Server Calls**: `lib/actions.ts` contains server actions that call Ollama directly
- **No HTTP Overhead**: Eliminates the need for API routes and HTTP requests
- **Type Safety**: Full TypeScript support from client to server
- **Better Performance**: Reduced latency and improved efficiency

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. 