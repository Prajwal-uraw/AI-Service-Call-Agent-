"use client"

import { useState, useEffect, useRef } from 'react'
import { X, MessageCircle, Send, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface LiveChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left'
  brandColor?: string
  agentName?: string
  agentAvatar?: string
  welcomeMessage?: string
}

export default function LiveChatWidget({
  position = 'bottom-right',
  brandColor = '#0ea5e9',
  agentName = 'Support Agent',
  agentAvatar = '/agent-avatar.png',
  welcomeMessage = "Hi! How can we help you today?"
}: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeMessage,
      sender: 'agent',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')

    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! Our team will get back to you shortly.",
        sender: 'agent',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6'

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 sm:bottom-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110",
          positionClasses
        )}
        style={{ backgroundColor: brandColor }}
        aria-label="Open chat"
      >
        <div className="relative p-4">
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-success-500 rounded-full animate-pulse" />
        </div>
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 sm:bottom-6 z-50 w-[90vw] sm:w-96 transition-all duration-300",
        positionClasses,
        isMinimized ? 'h-14' : 'h-[32rem]'
      )}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-neutral-200 flex flex-col h-full overflow-hidden">
        <div
          className="flex items-center justify-between p-4 text-white rounded-t-lg"
          style={{ backgroundColor: brandColor }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                {agentName.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-success-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{agentName}</h3>
              <p className="text-xs text-white/80">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 p-1.5 rounded transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                      message.sender === 'user'
                        ? 'bg-brand-500 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-900'
                    )}
                  >
                    <p>{message.text}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.sender === 'user' ? 'text-white/70' : 'text-neutral-500'
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-neutral-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="shrink-0"
                  style={{ backgroundColor: brandColor }}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-2 text-center">
                We typically reply in a few minutes
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
