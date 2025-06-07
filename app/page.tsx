'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { getChatResponse } from '@/lib/actions'
import { ChatMessage as OllamaChatMessage } from '@/lib/ollama'

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
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
  gap: 10px;
  margin-top: 15px;
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

interface ChatMessage {
  id: number
  content: string
  isUser: boolean
  timestamp: Date
}

// Remove the local interface since we're importing from ollama.ts

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const clearConversation = () => {
    setMessages([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

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

      // Call server action directly instead of API route
      const response = await getChatResponse(ollamaMessages)
      
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        content: response || 'Sorry, I could not generate a response.',
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        content: 'Sorry, there was an error processing your request. Please make sure Ollama is running locally.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <h1>🤖 AI Chatbot</h1>
        <p>Powered by Ollama - Chat with AI locally</p>
        <HeaderActions>
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
              Hello! I&apos;m your AI assistant powered by Ollama. How can I help you today?
            </MessageContent>
          </Message>
        ) : (
          messages.map((message) => (
            <Message key={message.id} $isUser={message.isUser}>
              <MessageLabel>
                {message.isUser ? 'You' : 'AI Assistant'}
              </MessageLabel>
              <MessageContent>{message.content}</MessageContent>
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