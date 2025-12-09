import { CheckCircle2, Mail, Phone, Video, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface HowToGetStartedProps {
  intent: 'join_now' | 'need_info';
}

export const HowToGetStarted = ({ intent }: HowToGetStartedProps) => {
  const isJoinNow = intent === 'join_now';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4 animate-in fade-in-50 duration-500">
        <div className="flex justify-center">
          <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold">
          {isJoinNow ? "🎉 Great! You're on Your Way!" : "📧 We've Got Your Questions!"}
        </h2>
        <p className="text-lg text-muted-foreground">
          {isJoinNow 
            ? "We've opened your MWR Life sign-up page in a new tab and sent you a welcome email."
            : "Thanks for your interest! We'll personally reach out within 24 hours to answer all your questions."
          }
        </p>
        {isJoinNow && (
          <Button 
            onClick={() => window.open('https://www.mwrlife.com/gocpotter', '_blank')}
            className="gap-2"
          >
            Didn't see the page? Click here to join MWR Life
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-6 animate-in fade-in-50 duration-700 delay-200">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl space-y-6">
          <h3 className="text-2xl font-bold">
            {isJoinNow ? "Here's What Happens Next:" : "How We'll Help You:"}
          </h3>

          {isJoinNow ? (
            <>
              {/* Step 1 - Join Now */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  1
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">Complete Your MWR Life Registration</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Click the button above if the sign-up page didn't open automatically. Complete your registration to unlock wholesale travel pricing.
                  </p>
                </div>
              </div>

              {/* Step 2 - Join Now */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  2
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">Check Your Welcome Email</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We've sent you a welcome email with your next steps and important information. Be sure to check your spam folder if you don't see it.
                  </p>
                </div>
              </div>

              {/* Step 3 - Join Now */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  3
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">We'll Reach Out Within 24 Hours</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We'll personally contact you to help you get started and guide you through your first booking. Get ready to start saving!
                  </p>
                </div>
              </div>

              {/* Step 4 - Join Now */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  4
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">Start Planning Your Trip</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Once you're all set up, you'll be able to book luxury travel at wholesale prices. Dream destinations are closer than you think!
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 1 - Need Info */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  1
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">We'll Call You Within 24 Hours</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We'll personally reach out at your preferred time to answer all your questions about MWR Life and help you make the best decision.
                  </p>
                </div>
              </div>

              {/* Step 2 - Need Info */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  2
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">Check Your Email for Answers</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We've sent you answers to common questions, real member testimonials, and exclusive content about wholesale travel pricing.
                  </p>
                </div>
              </div>

              {/* Step 3 - Need Info */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  3
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">Rewatch the Webinar</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    While you wait, scroll up and rewatch the webinar to dive deeper into how our members are saving thousands on luxury travel.
                  </p>
                </div>
              </div>

              {/* Step 4 - Need Info */}
              <div className="flex gap-4 items-start">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  4
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h4 className="text-xl font-semibold">Make Your Decision</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    After we answer your questions, you'll have all the information you need to decide if MWR Life is right for you. No pressure!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Encouragement */}
      <div className="text-center space-y-3 p-6 bg-secondary/10 rounded-xl animate-in fade-in-50 duration-1000 delay-500">
        <p className="text-lg font-medium">
          {isJoinNow ? "You've made a great decision! 🌟" : "Smart move asking questions first! 🌟"}
        </p>
        <p className="text-muted-foreground">
          {isJoinNow 
            ? "Thousands of members are already traveling more for less. You're next!"
            : "We're here to answer every question and help you make the best decision for your travel dreams."
          }
        </p>
      </div>
    </div>
  );
};
