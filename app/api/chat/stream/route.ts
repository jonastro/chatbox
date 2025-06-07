import { NextRequest } from 'next/server'
import { generateStreamingResponse, ChatMessage } from '@/lib/ollama'

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json()
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages array is required and cannot be empty', {
        status: 400,
      })
    }

    const selectedModel = model || 'deepseek-r1:latest'

    // Add system message for better context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are a helpful AI assistant. Be concise, helpful, and friendly in your responses.'
    }

    const allMessages: ChatMessage[] = [systemMessage, ...messages]

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          for await (const chunk of generateStreamingResponse(allMessages, selectedModel)) {
            const data = `data: ${JSON.stringify({ content: chunk })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
          
          // Send end marker
          const endData = `data: ${JSON.stringify({ done: true })}\n\n`
          controller.enqueue(encoder.encode(endData))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          const errorData = `data: ${JSON.stringify({ 
            error: 'An error occurred while streaming the response' 
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in streaming chat API:', error)
    return new Response('Internal server error', { status: 500 })
  }
} 