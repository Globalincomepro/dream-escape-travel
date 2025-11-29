import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'
import { getRandomInt } from '@/lib/utils'

interface Notification {
  id: string
  name: string
  location: string
  action: string
  timeAgo: string
}

interface SocialProofContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void
  recentSignups: number
}

const SocialProofContext = createContext<SocialProofContextType | null>(null)

export function useSocialProof() {
  const context = useContext(SocialProofContext)
  if (!context) {
    throw new Error('useSocialProof must be used within SocialProofProvider')
  }
  return context
}

const firstNames = ['Sarah', 'Mike', 'Jennifer', 'David', 'Lisa', 'Robert', 'Amanda', 'Chris', 'Emily', 'John', 'Maria', 'James', 'Linda', 'William', 'Patricia']
const locations = ['Texas', 'California', 'Florida', 'New York', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'Arizona', 'Colorado', 'Tennessee', 'Virginia', 'Washington', 'Massachusetts']
const actions = ['just requested info', 'signed up', 'started the quiz', 'watched the video']

function generateRandomNotification(): Omit<Notification, 'id'> {
  return {
    name: firstNames[getRandomInt(0, firstNames.length - 1)],
    location: locations[getRandomInt(0, locations.length - 1)],
    action: actions[getRandomInt(0, actions.length - 1)],
    timeAgo: `${getRandomInt(1, 15)} minutes ago`,
  }
}

export function SocialProofProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [recentSignups] = useState(getRandomInt(340, 520))

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setNotifications((prev) => [...prev, { ...notification, id }])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  // Show random notifications periodically
  useEffect(() => {
    // Initial delay before showing first notification
    const initialTimeout = setTimeout(() => {
      showNotification(generateRandomNotification())
    }, 8000)

    // Then show notifications every 25-45 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to show
        showNotification(generateRandomNotification())
      }
    }, getRandomInt(25000, 45000))

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <SocialProofContext.Provider value={{ showNotification, recentSignups }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed bottom-4 left-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-4 max-w-xs border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-ocean flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {notification.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-bold">{notification.name}</span> {notification.action}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {notification.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notification.timeAgo}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SocialProofContext.Provider>
  )
}

