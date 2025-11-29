import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  CheckCircle, Mail, Play, ArrowRight, 
  Calendar, Phone, MessageCircle, Share2,
  Facebook, Twitter, Linkedin
} from 'lucide-react'

export default function ThankYou() {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const nextSteps = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Check Your Email",
      description: "Your exclusive video access link is on its way! Check your inbox (and spam folder, just in case).",
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Watch the Video",
      description: "Learn exactly how we save 50-70% on every vacation and how you can too.",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Book a Call (Optional)",
      description: "Have questions? Schedule a free 15-minute call with us to learn more.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5">
      <Navigation />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -20, 
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 1 
              }}
              animate={{ 
                y: window.innerHeight + 20,
                rotate: Math.random() * 360,
                opacity: 0
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#0077B6', '#D4AF37', '#FF6B35', '#10B981'][Math.floor(Math.random() * 4)]
              }}
            />
          ))}
        </div>
      )}

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-foreground">
              You're In! 🎉
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Congratulations! You've taken the first step toward transforming how you travel.
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Here's What Happens Next</h2>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="p-6 flex items-start gap-4 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                      {step.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-primary">Step {index + 1}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Video Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-primary to-ocean p-6 text-white">
                <h3 className="text-xl font-bold mb-2">🎬 Your Exclusive Video Is Ready!</h3>
                <p className="text-white/90">
                  Check your email for instant access to our step-by-step guide
                </p>
              </div>
              <div className="p-6">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                      <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                    </div>
                    <p className="text-muted-foreground">Video link sent to your email</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button className="text-primary hover:underline">contact us</button>
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid md:grid-cols-2 gap-4 mb-12"
          >
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-1">Schedule a Call</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Free 15-minute discovery call
              </p>
              <Button variant="outline" size="sm">
                Book Now <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-1">Have Questions?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Chat with us anytime
              </p>
              <Button variant="outline" size="sm">
                Start Chat <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          </motion.div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Card className="p-8 bg-muted/30">
              <Share2 className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Know Someone Who Loves to Travel?</h3>
              <p className="text-muted-foreground mb-6">
                Share this opportunity with friends and family who deserve amazing vacations too!
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="ghost">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

