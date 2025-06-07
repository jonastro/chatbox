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

export async function* generateStreamingResponse(messages: ChatMessage[], model: string = 'deepseek-r1:latest'): AsyncGenerator<string, void, unknown> {
  try {
    const response = await ollama.chat({
      model: model,
      messages: messages,
      stream: true,
    })
    
    for await (const part of response) {
      if (part.message?.content) {
        yield part.message.content
      }
    }
  } catch (error) {
    console.error('Error calling Ollama streaming:', error)
    yield 'Sorry, I encountered an error while processing your request. Please make sure Ollama is running locally.'
  }
}

export interface OllamaModel {
  name: string
  model: string
  modified_at: Date
  size: number
  digest: string
  details: {
    parent_model?: string
    format: string
    family: string
    families?: string[]
    parameter_size: string
    quantization_level: string
  }
}

export async function getAvailableModels(): Promise<OllamaModel[]> {
  try {
    const response = await ollama.list()
    return response.models || []
  } catch (error) {
    console.error('Error fetching available models:', error)
    return []
  }
} 