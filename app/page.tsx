'use client'

import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { ChatMessage as OllamaChatMessage, OllamaModel } from '@/lib/ollama'
import { ContentRenderer } from '@/app/chat/components/ContentRenderer'

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

const ChatHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: white;
  
  h1 {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }
  
  p {
    margin: 10px 0 0 0;
    opacity: 0.9;
    font-size: 1.1rem;
  }
`

const HeaderActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
`

const ModelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 0.9rem;
`

const ModelSelect = styled.select`
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  font-size: 0.85rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  outline: none;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  option {
    background: #333;
    color: white;
  }
`

const ClearButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const RefreshButton = styled.button`
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const Message = styled.div<{ $isUser: boolean }>`
  margin-bottom: 15px;
  padding: 15px 20px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  ${props => props.$isUser ? `
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    margin-left: auto;
    text-align: right;
  ` : `
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    margin-right: auto;
  `}
`

const MessageLabel = styled.div`
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 5px;
  opacity: 0.8;
`

const MessageContent = styled.div`
  line-height: 1.5;
  white-space: pre-wrap;
`

const ThinkingSection = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  font-style: italic;
  opacity: 0.8;
  font-size: 0.9em;
`

const ThinkingToggle = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.8em;
  margin-bottom: 5px;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`

const ThinkingContent = styled.div<{ $isExpanded: boolean }>`
  max-height: ${props => props.$isExpanded ? 'none' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  white-space: pre-wrap;
  
  ${props => !props.$isExpanded && 'line-height: 0;'}
`



const ChatForm = styled.form`
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const MessageInput = styled.input`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  outline: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
`

const SendButton = styled.button`
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const TypingIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  &::after {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.6;
    animation: pulse 1.4s ease-in-out infinite both;
  }
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.4;
    animation: pulse 1.4s ease-in-out 0.2s infinite both;
    margin-right: 2px;
  }
  
  @keyframes pulse {
    0%, 80%, 100% {
      transform: scale(1);
      opacity: 0.4;
    }
    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`

interface ChatMessage {
  id: number
  content: string
  thinkingContent: string
  isUser: boolean
  timestamp: Date
}

enum StreamingState {
  NORMAL = 'normal',
  THINKING = 'thinking',
  MATH_DISPLAY = 'math_display',
  MATH_INLINE = 'math_inline',
  PARTIAL_OPEN_TAG = 'partial_open_tag',
  PARTIAL_CLOSE_TAG = 'partial_close_tag'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null)
  const [expandedThinking, setExpandedThinking] = useState<Set<number>>(new Set())
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('deepseek-r1:latest')
  const [modelsLoading, setModelsLoading] = useState(true)

  const clearConversation = () => {
    setMessages([])
    setExpandedThinking(new Set())
  }

  const fetchModels = async () => {
    try {
      setModelsLoading(true)
      const response = await fetch('/api/models')
      const data = await response.json()
      if (data.models) {
        setAvailableModels(data.models)
        // Set first available model as default if current selection is not available
        if (data.models.length > 0 && !data.models.find((m: OllamaModel) => m.name === selectedModel)) {
          setSelectedModel(data.models[0].name)
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setModelsLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const formatModelName = (name: string) => {
    // Format model names for better display
    return name.replace(/[:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const toggleThinking = (messageId: number) => {
    setExpandedThinking(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      content: input.trim(),
      thinkingContent: '',
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Create AI message placeholder for streaming
    const aiMessageId = Date.now() + 1
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: '',
      thinkingContent: '',
      isUser: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiMessage])
    setStreamingMessageId(aiMessageId)

    try {
      // Convert chat messages to Ollama format with conversation history
      const ollamaMessages: OllamaChatMessage[] = [
        ...messages.map((msg): OllamaChatMessage => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage.content
        }
      ]

      // Use streaming API
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: ollamaMessages,
          model: selectedModel 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No reader available')
      }

      let accumulatedContent = ''
      let accumulatedThinking = ''
      let buffer = ''
      let state = StreamingState.NORMAL

      const processContent = (newChunk: string) => {
        buffer += newChunk
        let processedContent = ''
        let processedThinking = ''
        
        while (buffer.length > 0) {
          if (state === StreamingState.NORMAL) {
            const thinkStartIndex = buffer.indexOf('<think>')
            if (thinkStartIndex === -1) {
              // No thinking tag found, add to content
              processedContent += buffer
              buffer = ''
            } else {
              // Found start of thinking
              processedContent += buffer.substring(0, thinkStartIndex)
              buffer = buffer.substring(thinkStartIndex + 7) // Remove '<think>'
              state = StreamingState.THINKING
            }
          } else if (state === StreamingState.THINKING) {
            const thinkEndIndex = buffer.indexOf('</think>')
            if (thinkEndIndex === -1) {
              // No end tag found yet, add all to thinking
              processedThinking += buffer
              buffer = ''
            } else {
              // Found end of thinking
              processedThinking += buffer.substring(0, thinkEndIndex)
              buffer = buffer.substring(thinkEndIndex + 8) // Remove '</think>'
              state = StreamingState.NORMAL
            }
          }
        }
        
        return { processedContent, processedThinking }
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.error)
              }
              
              if (data.done) {
                setStreamingMessageId(null)
                break
              }
              
              if (data.content) {
                const { processedContent, processedThinking } = processContent(data.content)
                accumulatedContent += processedContent
                accumulatedThinking += processedThinking
                
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { 
                          ...msg, 
                          content: accumulatedContent,
                          thinkingContent: accumulatedThinking
                        }
                      : msg
                  )
                )
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { 
                ...msg, 
                content: 'Sorry, there was an error processing your request. Please make sure Ollama is running locally.',
                thinkingContent: ''
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      setStreamingMessageId(null)
    }
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <h1>🤖 AI Chatbot</h1>
        <p>Powered by Ollama - Chat with AI locally</p>
        <HeaderActions>
          <ModelSelector>
            <span>🧠 Model:</span>
            <ModelSelect
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={modelsLoading || isLoading}
            >
              {modelsLoading ? (
                <option>Loading models...</option>
              ) : availableModels.length === 0 ? (
                <option>No models available</option>
              ) : (
                availableModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {formatModelName(model.name)}
                  </option>
                ))
              )}
            </ModelSelect>
            <RefreshButton
              onClick={fetchModels}
              disabled={modelsLoading}
              title="Refresh available models"
            >
              🔄
            </RefreshButton>
          </ModelSelector>
          <ClearButton 
            onClick={clearConversation}
            disabled={isLoading || messages.length === 0}
          >
            🗑️ Clear Conversation
          </ClearButton>
        </HeaderActions>
      </ChatHeader>
      
      <ChatMessages>
        {messages.length === 0 ? (
          <Message $isUser={false}>
            <MessageLabel>AI Assistant</MessageLabel>
            <MessageContent>
              Hello! I&apos;m your AI assistant powered by {formatModelName(selectedModel)}. 
              {selectedModel.includes('deepseek-r1') && ' I can show my thinking process as I work through problems.'} 
              How can I help you today?
            </MessageContent>
          </Message>
        ) : (
          messages.map((message) => (
            <Message key={message.id} $isUser={message.isUser}>
              <MessageLabel>
                {message.isUser ? 'You' : 'AI Assistant'}
              </MessageLabel>
              <MessageContent>
                {!message.isUser && message.thinkingContent && (
                  <ThinkingSection>
                    <ThinkingToggle onClick={() => toggleThinking(message.id)}>
                      🧠 {expandedThinking.has(message.id) ? 'Hide' : 'Show'} Thinking Process
                    </ThinkingToggle>
                    <ThinkingContent $isExpanded={expandedThinking.has(message.id)}>
                      <ContentRenderer content={message.thinkingContent} />
                    </ThinkingContent>
                  </ThinkingSection>
                )}
                <ContentRenderer content={message.content} />
                {streamingMessageId === message.id && !message.content && !message.thinkingContent && (
                  <TypingIndicator>Thinking</TypingIndicator>
                )}
                {streamingMessageId === message.id && (message.content || message.thinkingContent) && (
                  <TypingIndicator />
                )}
              </MessageContent>
            </Message>
          ))
        )}
        
        {isLoading && (
          <Message $isUser={false}>
            <MessageLabel>AI Assistant</MessageLabel>
            <MessageContent>
              <LoadingSpinner /> Thinking...
            </MessageContent>
          </Message>
        )}
      </ChatMessages>
      
      <ChatForm onSubmit={handleSubmit}>
        <MessageInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <SendButton type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? <LoadingSpinner /> : 'Send'}
        </SendButton>
      </ChatForm>
    </ChatContainer>
  )
} 