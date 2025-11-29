import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { 
  Palmtree, Mountain, Building2, Ship, 
  Users, Heart, Briefcase, Sparkles,
  DollarSign, Gem, Crown,
  Sun, Snowflake, Leaf, CloudSun,
  ArrowRight, ArrowLeft, Loader2, CheckCircle
} from 'lucide-react'

interface QuizAnswer {
  id: string
  text: string
  icon: React.ReactNode
  value: string
}

interface QuizQuestion {
  id: string
  question: string
  answers: QuizAnswer[]
}

const questions: QuizQuestion[] = [
  {
    id: 'destination',
    question: "What's your dream vacation destination?",
    answers: [
      { id: 'beach', text: 'Tropical Beach Paradise', icon: <Palmtree className="w-8 h-8" />, value: 'beach' },
      { id: 'adventure', text: 'Mountain Adventure', icon: <Mountain className="w-8 h-8" />, value: 'adventure' },
      { id: 'city', text: 'Cultural City Exploration', icon: <Building2 className="w-8 h-8" />, value: 'city' },
      { id: 'cruise', text: 'Luxury Cruise', icon: <Ship className="w-8 h-8" />, value: 'cruise' },
    ],
  },
  {
    id: 'travel_with',
    question: "Who do you usually travel with?",
    answers: [
      { id: 'family', text: 'Family with Kids', icon: <Users className="w-8 h-8" />, value: 'family' },
      { id: 'couple', text: 'Romantic Getaway', icon: <Heart className="w-8 h-8" />, value: 'couple' },
      { id: 'solo', text: 'Solo Adventure', icon: <Briefcase className="w-8 h-8" />, value: 'solo' },
      { id: 'friends', text: 'Friends Trip', icon: <Sparkles className="w-8 h-8" />, value: 'friends' },
    ],
  },
  {
    id: 'budget',
    question: "What's your typical vacation budget?",
    answers: [
      { id: 'budget', text: 'Budget-Friendly ($1,000-2,500)', icon: <DollarSign className="w-8 h-8" />, value: 'budget' },
      { id: 'moderate', text: 'Moderate ($2,500-5,000)', icon: <Gem className="w-8 h-8" />, value: 'moderate' },
      { id: 'luxury', text: 'Luxury ($5,000-10,000)', icon: <Crown className="w-8 h-8" />, value: 'luxury' },
      { id: 'unlimited', text: 'Sky\'s the Limit ($10,000+)', icon: <Sparkles className="w-8 h-8" />, value: 'unlimited' },
    ],
  },
  {
    id: 'season',
    question: "When do you prefer to travel?",
    answers: [
      { id: 'summer', text: 'Summer Sun', icon: <Sun className="w-8 h-8" />, value: 'summer' },
      { id: 'winter', text: 'Winter Wonderland', icon: <Snowflake className="w-8 h-8" />, value: 'winter' },
      { id: 'fall', text: 'Fall Colors', icon: <Leaf className="w-8 h-8" />, value: 'fall' },
      { id: 'anytime', text: 'Anytime is Good!', icon: <CloudSun className="w-8 h-8" />, value: 'anytime' },
    ],
  },
]

const personalityResults = {
  beach_lover: {
    title: "Beach Lover",
    emoji: "🏖️",
    description: "You crave sun, sand, and crystal-clear waters. Your ideal vacation involves lounging by the pool, snorkeling in tropical reefs, and sipping cocktails at sunset.",
    destinations: ["Caribbean Islands", "Maldives", "Hawaii", "Cancun"],
    savings: "Save up to 70% on luxury beach resorts with wholesale pricing!"
  },
  adventure_seeker: {
    title: "Adventure Seeker",
    emoji: "🏔️",
    description: "You live for thrills and new experiences. Whether it's hiking mountains, zip-lining through rainforests, or exploring hidden caves, you want your vacation to be unforgettable.",
    destinations: ["Costa Rica", "New Zealand", "Swiss Alps", "Patagonia"],
    savings: "Save up to 60% on adventure resort packages with wholesale pricing!"
  },
  culture_explorer: {
    title: "Culture Explorer",
    emoji: "🏛️",
    description: "You're drawn to history, art, and authentic local experiences. Museums, historic sites, and local cuisine are your vacation highlights.",
    destinations: ["Paris", "Rome", "Tokyo", "Barcelona"],
    savings: "Save up to 65% on city hotels and cultural tours with wholesale pricing!"
  },
  luxury_cruiser: {
    title: "Luxury Cruiser",
    emoji: "🚢",
    description: "You love the all-inclusive experience of cruising - gourmet dining, entertainment, and waking up to new destinations without packing and unpacking.",
    destinations: ["Mediterranean", "Alaska", "Caribbean", "Norwegian Fjords"],
    savings: "Save up to 50% on premium cruise lines with wholesale pricing!"
  }
}

function getPersonalityResult(answers: Record<string, string>): keyof typeof personalityResults {
  const dest = answers.destination
  if (dest === 'beach') return 'beach_lover'
  if (dest === 'adventure') return 'adventure_seeker'
  if (dest === 'cruise') return 'luxury_cruiser'
  return 'culture_explorer'
}

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      setTimeout(() => setShowResults(true), 300)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const personalityKey = getPersonalityResult(answers)
  const result = personalityResults[personalityKey]

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save lead to database
      const { error } = await supabase
        .from('leads')
        .insert({
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone || null,
          source: 'quiz',
          intent: personalityKey,
          status: 'new'
        })

      if (error) throw error

      toast({
        title: "🎉 Your results are on the way!",
        description: "Check your email for your personalized travel guide.",
      })

      // Redirect to webinar or thank you page
      navigate('/webinar')
    } catch (error: any) {
      console.error('Error submitting quiz:', error)
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-amber-50/50">
      <Navigation />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Discover Your Travel Personality
            </h1>
            <p className="text-muted-foreground">
              Answer 4 quick questions to unlock your personalized travel profile
            </p>
          </div>

          {/* Progress Bar */}
          {!showResults && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Quiz Content */}
          {!showResults ? (
            <div className="animate-in fade-in slide-in-from-right duration-300">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-center mb-8">
                  {questions[currentQuestion].question}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {questions[currentQuestion].answers.map((answer) => (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswer(answer.value)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                        answers[questions[currentQuestion].id] === answer.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-primary mb-3">{answer.icon}</div>
                      <span className="font-medium">{answer.text}</span>
                    </button>
                  ))}
                </div>

                {currentQuestion > 0 && (
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="mt-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
              </Card>
            </div>
          ) : !showForm ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">{result.emoji}</div>
                <h2 className="text-3xl font-bold mb-2">
                  You're a {result.title}!
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {result.description}
                </p>

                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <h3 className="font-bold mb-3">Perfect Destinations for You:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.destinations.map((dest) => (
                      <span
                        key={dest}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                  <p className="text-amber-800 font-semibold">{result.savings}</p>
                </div>

                <Button
                  size="lg"
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-primary to-blue-600"
                >
                  Get My Personalized Travel Guide
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom duration-300">
              <Card className="p-8">
                <div className="text-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
                  <p className="text-muted-foreground">
                    Enter your details to receive your personalized {result.title} travel guide
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-blue-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send My Results
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
