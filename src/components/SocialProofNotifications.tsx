import { useEffect, useState } from 'react'
import { MapPin, Clock } from 'lucide-react'

interface Notification {
  id: string
  name: string
  location: string
  action: string
  timeAgo: string
}

const firstNames = ['Sarah', 'Mike', 'Jennifer', 'David', 'Lisa', 'Robert', 'Amanda', 'Chris', 'Emily', 'John', 'Maria', 'James', 'Linda', 'William', 'Patricia', 'Michael', 'Susan', 'Kevin', 'Nancy', 'Brian']
const locations = ['Texas', 'California', 'Florida', 'New York', 'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'Arizona', 'Colorado', 'Tennessee', 'Virginia', 'Washington', 'Massachusetts', 'Nevada', 'Oregon', 'Minnesota']
const actions = ['just requested info', 'signed up', 'started watching the video', 'joined the webinar']

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomNotification(): Notification {
  return {
    id: Math.random().toString(36).substring(7),
    name: firstNames[getRandomInt(0, firstNames.length - 1)],
    location: locations[getRandomInt(0, locations.length - 1)],
    action: actions[getRandomInt(0, actions.length - 1)],
    timeAgo: `${getRandomInt(1, 12)} minutes ago`,
  }
}

export function SocialProofNotifications() {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show first notification after 8 seconds
    const initialTimeout = setTimeout(() => {
      showNotification()
    }, 8000)

    // Then show notifications every 30-60 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to show
        showNotification()
      }
    }, getRandomInt(30000, 60000))

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  const showNotification = () => {
    const newNotification = generateRandomNotification()
    setNotification(newNotification)
    setIsVisible(true)

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  if (!notification || !isVisible) return null

  return (
    <div 
      className="fixed bottom-24 left-4 z-40 animate-in slide-in-from-left duration-500"
      style={{ 
        animation: isVisible 
          ? 'slideIn 0.5s ease-out forwards' 
          : 'slideOut 0.5s ease-in forwards' 
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-xs border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {notification.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-bold">{notification.name}</span> {notification.action}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
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
        {/* Verification badge */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-green-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified by Dream Escape Travel
          </p>
        </div>
      </div>
    </div>
  )
}

