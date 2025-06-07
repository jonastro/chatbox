import { Ollama } from 'ollama'

const ollama = new Ollama({
  host: 'http://localhost:11434',
})

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function generateResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await ollama.chat({
      model: 'llama3.2', // You can change this to any model you have installed
      messages: messages,
    })
    
    return response.message.content
  } catch (error) {
    console.error('Error calling Ollama:', error)
    return 'Sorry, I encountered an error while processing your request. Please make sure Ollama is running locally.'
  }
} 