import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { createLead } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { 
  Calculator, DollarSign, TrendingDown, Plane, 
  Hotel, Ship, ArrowRight, Loader2, Sparkles,
  PiggyBank, Calendar
} from 'lucide-react'

export default function CalculatorPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    tripsPerYear: 2,
    avgHotelNight: 200,
    nightsPerTrip: 5,
    flightCost: 500,
    includesCruise: false,
    cruiseCost: 2000,
  })
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Calculate savings
  const retailTotal = 
    (formData.avgHotelNight * formData.nightsPerTrip * formData.tripsPerYear) +
    (formData.flightCost * formData.tripsPerYear) +
    (formData.includesCruise ? formData.cruiseCost : 0)

  const wholesaleDiscount = 0.55 // 55% average savings
  const wholesaleTotal = retailTotal * (1 - wholesaleDiscount)
  const annualSavings = retailTotal - wholesaleTotal
  const fiveYearSavings = annualSavings * 5

  const handleCalculate = () => {
    setShowResults(true)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createLead({
        email: contactData.email,
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        lead_score: 45,
        lead_status: 'warm',
        source: 'calculator',
      })

      toast({
        title: "🎉 Your savings report is ready!",
        description: "Check your email for your detailed savings breakdown.",
      })

      navigate('/thank-you')
    } catch (error) {
      console.error('Error:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-gold/5 via-background to-primary/5">
      <Navigation />

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-10 h-10 text-gold-dark" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Travel Savings Calculator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See exactly how much you could save with wholesale travel pricing
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <div className={`w-24 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* Step 1: Input Form */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center">
                    Tell Us About Your Travel Habits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        How many trips do you take per year?
                      </Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.tripsPerYear}
                          onChange={(e) => setFormData({ ...formData, tripsPerYear: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-2xl font-bold text-primary w-12 text-center">
                          {formData.tripsPerYear}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Hotel className="w-4 h-4 text-primary" />
                        Average hotel cost per night
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.avgHotelNight}
                          onChange={(e) => setFormData({ ...formData, avgHotelNight: parseInt(e.target.value) || 0 })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Average nights per trip
                      </Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="14"
                          value={formData.nightsPerTrip}
                          onChange={(e) => setFormData({ ...formData, nightsPerTrip: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-2xl font-bold text-primary w-12 text-center">
                          {formData.nightsPerTrip}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Plane className="w-4 h-4 text-primary" />
                        Average flight cost per trip
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="number"
                          value={formData.flightCost}
                          onChange={(e) => setFormData({ ...formData, flightCost: parseInt(e.target.value) || 0 })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <input
                        type="checkbox"
                        id="cruise"
                        checked={formData.includesCruise}
                        onChange={(e) => setFormData({ ...formData, includesCruise: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <Label htmlFor="cruise" className="flex items-center gap-2 cursor-pointer">
                        <Ship className="w-4 h-4 text-primary" />
                        I also take cruises (add cruise budget)
                      </Label>
                    </div>

                    {formData.includesCruise && (
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Ship className="w-4 h-4 text-primary" />
                          Annual cruise budget
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="number"
                            value={formData.cruiseCost}
                            onChange={(e) => setFormData({ ...formData, cruiseCost: parseInt(e.target.value) || 0 })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="lg"
                    variant="gold"
                    className="w-full"
                    onClick={handleCalculate}
                  >
                    Calculate My Savings
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === 2 && showResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Savings Summary */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-ocean p-8 text-white text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Your Potential Annual Savings</h2>
                  <div className="text-6xl font-heading font-bold mb-2">
                    {formatCurrency(annualSavings)}
                  </div>
                  <p className="text-white/80">per year with wholesale travel pricing</p>
                </div>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Retail vs Wholesale */}
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-primary" />
                        Your Savings Breakdown
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-red-700">Retail Price</span>
                          <span className="font-bold text-red-700">{formatCurrency(retailTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="text-green-700">Wholesale Price</span>
                          <span className="font-bold text-green-700">{formatCurrency(wholesaleTotal)}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                          <span className="text-primary font-semibold">You Save</span>
                          <span className="font-bold text-primary text-xl">{formatCurrency(annualSavings)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Long-term Savings */}
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-gold-dark" />
                        Long-Term Impact
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gold/10 rounded-xl text-center">
                          <p className="text-sm text-muted-foreground mb-1">5-Year Savings</p>
                          <p className="text-3xl font-bold text-gold-dark">{formatCurrency(fiveYearSavings)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          That's enough for {Math.floor(fiveYearSavings / (formData.avgHotelNight * formData.nightsPerTrip))} extra 
                          vacation trips!
                        </p>
                      </div>

                      {/* Savings Visualization */}
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Savings Rate</span>
                          <span className="font-bold text-primary">55%</span>
                        </div>
                        <Progress value={55} className="h-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Card */}
              <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-gold/5">
                <h3 className="text-2xl font-bold mb-4">
                  Want to Start Saving {formatCurrency(annualSavings)}/Year?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Get your personalized savings report and learn exactly how to access 
                  wholesale travel pricing for your next vacation.
                </p>
                <Button
                  size="lg"
                  variant="gold"
                  onClick={() => setStep(3)}
                >
                  Get My Free Savings Report
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Contact Form */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PiggyBank className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle>Get Your Savings Report</CardTitle>
                  <p className="text-muted-foreground">
                    We'll email you a detailed breakdown plus our free video guide
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={contactData.firstName}
                          onChange={(e) => setContactData({ ...contactData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={contactData.lastName}
                          onChange={(e) => setContactData({ ...contactData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">Your potential savings:</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(annualSavings)}/year</p>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      variant="gold"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send My Report
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

