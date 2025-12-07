import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Navigation } from "@/components/Navigation";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import heroImage from "@/assets/background-travel.png";
import gallery1 from "@/assets/franceski.png";
import gallery2 from "@/assets/france-village.png";
import gallery3 from "@/assets/mexico-breakfast.png";
import gallery4 from "@/assets/new-orleans-church.jpeg";
import { Plane, DollarSign, Users, Sparkles } from "lucide-react";
const Index = () => {
  const travelStories = [{
    src: gallery1,
    location: "French Alps",
    caption: "Skiing adventure in the mountains"
  }, {
    src: gallery2,
    location: "French Village",
    caption: "Charming restaurant experience"
  }, {
    src: gallery3,
    location: "Mexico",
    caption: "Delicious breakfast overlooking the coast"
  }, {
    src: gallery4,
    location: "New Orleans",
    caption: "Historic church in the French Quarter"
  }];
  const howWeDoIt = [{
    icon: DollarSign,
    title: "We discovered wholesale pricing",
    description: "That first trip showed us we could stay at four- and five-star resorts for what we used to pay for three-star hotels"
  }, {
    icon: Plane,
    title: "The world opened up",
    description: "Suddenly, those destinations we only dreamed about became real possibilities for us"
  }, {
    icon: Users,
    title: "We brought our loved ones",
    description: "Now we're creating memories with our whole family - something we never thought we could afford"
  }, {
    icon: Sparkles,
    title: "Travel became our lifestyle",
    description: "We went from one vacation every few years to exploring the world regularly"
  }];
  return <div className="min-h-screen">
      <Navigation />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 animate-in fade-in duration-1000">
          {/* Headline and Description centered */}
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 sm:mb-6 leading-tight animate-in fade-in slide-in-from-bottom duration-700">
              Travel More. Spend Less. Live Better.
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 font-medium leading-relaxed px-2 sm:px-0">
              We're Donna & Charles—a regular couple who cracked the code to luxury travel. Unlock wholesale travel prices and explore the world with a community of everyday people who want more adventure, more freedom, and more unforgettable memories.
            </p>
            
            <button 
              onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })} 
              className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary text-base sm:text-lg font-bold rounded-lg hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
            >
              Show Me How →
            </button>
          </div>
        </div>
      </section>

      {/* Video Introduction Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Before We Share Our Secret...
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            In this short video, we'll reveal exactly how we went from one vacation 
            every few years to traveling the world regularly—without winning the lottery 
            or going into debt. This isn't for everyone, but if you're ready to transform 
            how you travel, keep watching.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <Card className="overflow-hidden bg-card border-border shadow-lg">
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                {/* Placeholder for video - replace with actual video embed */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Play button overlay */}
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer group">
                      <svg className="w-8 h-8 text-primary ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center text-foreground">
            Hi, we're Donna and Charles Potter
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              For years, we watched travel shows and dreamed and talked about exotic destinations - the Mediterranean, 
              the Caribbean, mountain resorts in Europe. But with the kids to raise and bills to pay, 
              those dreams stayed just that: dreams.
            </p>
            
            <p>
              Then the kids grew up and moved out. Finally, we had the opportunity we'd been awaiting for years. We wanted to travel together, to finally see the world we'd only 
              read about. We were able to take a few international trips and enjoyed some amazing sites. However our ultimate dream vacations such as luxury resorts, ocean-view rooms, five-star experiences were still out of reach due to cost.
            </p>
            
            <p className="text-xl font-semibold text-foreground">
              Then Things Changed.
            </p>
            
            <p>
              A friend told us about a travel membership program they'd been using. At first, we were 
              skeptical - we'd heard pitches before. But they showed us their photos, their receipts, 
              the actual resorts where they stayed. Four-star and five-star properties for prices we 
              couldn't believe.
            </p>
            
            <p>
              Now we are able to plan exotic dream vacations for ourselves as well as family to create special moments now, that will become treasured memories tomorrow. We just want to take some time to show you these amazing benefits as well. We are not rich. We are just regular everyday people who found a way to make it work and now the world is our oyster!
            </p>
            
            <p className="text-xl font-semibold text-foreground">
              Would you like to know how to leverage this travel membership program to get wholesale travel prices on cruises, all-inclusive resorts, luxury hotels and even air fare?
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground">
            Places We Never Thought We'd See
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Each photo represents a dream that came true
          </p>
          
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {travelStories.map((story, index) => <CarouselItem key={index}>
                  <Card className="overflow-hidden border-border">
                    <div className="relative bg-black flex items-center justify-center" style={{
                  minHeight: '500px'
                }}>
                      <img src={story.src} alt={story.location} className="max-h-[600px] w-auto object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <h3 className="text-3xl font-bold mb-2">{story.location}</h3>
                        <p className="text-white/90 text-lg leading-relaxed">{story.caption}</p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* How We Do It Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground">
            Here's What Changed for Us
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            The travel membership program we discovered didn't just save us money - it transformed 
            how we live. Here's what changed:
          </p>

          <div className="max-w-3xl mx-auto space-y-6">
            {howWeDoIt.map((item, index) => <div key={index} className="flex items-start gap-4 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to Join Us? Here's Your Next Step
          </h2>
          
          <div className="text-left max-w-3xl mx-auto mb-12 space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Here's the truth: This opportunity isn't widely advertised. We're sharing it 
              personally because we know how it changed our lives—and we've seen it change 
              our friends and family lives too.
            </p>
            
            <p className="font-semibold text-foreground">
              When you fill out the form below, you'll get IMMEDIATE access to our exclusive 
              video that reveals:
            </p>
            
            <ul className="space-y-3 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>The exact travel membership we use (and how to get it)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>How we book $500/night resorts for under $150</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>The simple system that lets us travel 4-5 times per year</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold flex-shrink-0">✓</span>
                <span>How you can potentially earn income while you explore the world</span>
              </li>
            </ul>
            
            <p>
              This isn't a sales pitch. It's an invitation to see what's possible.
            </p>
            
            <p className="font-semibold text-foreground">
              The only question is: Are you ready to stop watching others travel and start 
              creating your own adventures?
            </p>
            
            <p className="italic text-center border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded">
              Fair warning: Once you see how simple this is, you'll wish you'd known about 
              it years ago. But better late than never, right?
            </p>
          </div>
          
          <div className="mb-8">
            <div className="inline-block bg-primary/10 border border-primary/20 rounded-lg px-6 py-3 mb-6">
              <p className="text-primary font-semibold flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limited spots available!!
              </p>
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              Get Instant Access - Free Informational Video
            </h3>
            <p className="text-muted-foreground mb-8">
              Enter your details below for immediate access to our 
              step-by-step video guide. No credit card required. No sales calls. 
              Just real information from real people.
            </p>
          </div>
          
          <div id="lead-form" className="scroll-mt-20">
            <LeadCaptureForm />
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your information is 100% secure. We respect your privacy and will never spam you. You can unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Earth Resonance Wellness. All rights reserved.</p>
        </div>
      </footer>
    </div>;
};
export default Index;