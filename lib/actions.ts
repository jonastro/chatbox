'use server'

import { generateResponse, ChatMessage } from './ollama'

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    // Add system message for better context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are a helpful AI assistant. Be concise, helpful, and friendly in your responses.'
    }

    const allMessages: ChatMessage[] = [systemMessage, ...messages]
    const response = await generateResponse(allMessages)
    
    return response
  } catch (error) {
    console.error('Error in server action:', error)
    return 'Sorry, I encountered an error while processing your request. Please make sure Ollama is running locally.'
  }
} 