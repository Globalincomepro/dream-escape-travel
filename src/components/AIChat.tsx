import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi! 👋 I'm here to help answer any questions about our travel membership. What would you like to know?",
  },
]

const quickQuestions = [
  "How much can I save?",
  "How does it work?",
  "Is this a scam?",
  "What destinations?",
]

// AI Response logic - rule-based for now, can be connected to OpenAI later
function getAIResponse(question: string): string {
  const q = question.toLowerCase()
  
  if (q.includes('save') || q.includes('cost') || q.includes('price') || q.includes('money')) {
    return "Great question! Most of our members save 50-70% on their travel. For example, a $500/night resort might cost you just $150-200. The exact savings depend on where and when you travel. Want me to show you our savings calculator? 💰"
  }
  
  if (q.includes('work') || q.includes('how')) {
    return "It's simple! We've partnered with a travel membership that gives you access to wholesale pricing - the same rates travel agents pay. You'll get access to thousands of resorts, hotels, cruises, and more at deeply discounted prices. Would you like to watch our quick video that explains everything? 🎬"
  }
  
  if (q.includes('scam') || q.includes('legit') || q.includes('real') || q.includes('trust')) {
    return "I totally understand the skepticism - we were the same way at first! This is a legitimate travel membership that's been around for years. We're Donna and Charles, a real couple who uses this every time we travel. Check out our gallery of real trips we've taken! No pressure, just real information. 😊"
  }
  
  if (q.includes('destination') || q.includes('where') || q.includes('place') || q.includes('country')) {
    return "The membership includes destinations worldwide! Caribbean, Mexico, Europe, Asia, Hawaii, and more. We've personally been to France, Mexico, and New Orleans through this program. Is there a specific destination you're dreaming about? 🌍"
  }
  
  if (q.includes('mlm') || q.includes('network') || q.includes('sell')) {
    return "I appreciate you asking directly! Yes, there is an optional income opportunity, but that's not why we're here. We focus on the travel savings because that's what transformed OUR lives. The business side is there if you want it, but most people just enjoy the incredible travel deals. No pressure either way! 🙌"
  }
  
  if (q.includes('join') || q.includes('sign up') || q.includes('start') || q.includes('begin')) {
    return "Awesome! The best next step is to watch our short video that explains everything in detail. Just enter your info in the form below and you'll get instant access. It's free to watch, and there's no obligation. Ready to see how we do it? ✨"
  }
  
  if (q.includes('cruise') || q.includes('ship')) {
    return "Yes! The membership includes amazing cruise deals too - we're talking luxury cruises at wholesale prices. Caribbean, Mediterranean, Alaska... all available at significant discounts. Have you been on a cruise before? 🚢"
  }
  
  if (q.includes('family') || q.includes('kid') || q.includes('children')) {
    return "Family travel is one of our favorite benefits! We've taken our whole family on trips we never thought we could afford. The membership works for all group sizes, and the savings really add up when you're booking for a family. Are you planning a family vacation? 👨‍👩‍👧‍👦"
  }
  
  return "That's a great question! The best way to get all the details is to watch our short video - it covers everything about how the membership works and how we've used it to transform our travel. Would you like instant access? Just fill out the form and I'll send it right over! 🎬"
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const response = getAIResponse(content)
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary to-ocean rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-ocean p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Travel Assistant</h3>
                    <p className="text-xs text-white/80">Ask me anything!</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-gray-100 text-foreground rounded-bl-sm'
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

