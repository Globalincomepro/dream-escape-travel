import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Navigation } from "@/components/Navigation";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/background-travel.png";
import gallery1 from "@/assets/franceski.png";
import gallery2 from "@/assets/france-village.png";
import gallery3 from "@/assets/mexico-breakfast.png";
import gallery4 from "@/assets/new-orleans-church.jpeg";
import { Loader2, ExternalLink } from "lucide-react";

interface FunnelData {
  id: string;
  funnel_slug: string;
  hero_image_url: string | null;
  custom_headline: string | null;
  custom_bio: string | null;
  vip_join_url: string | null;
  is_active: boolean;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    tagline: string | null;
    bio: string | null;
  };
}

interface GalleryImage {
  id: string;
  image_url: string;
  location: string;
  caption: string;
  sort_order: number;
}

const Funnel = () => {
  const { funnelSlug } = useParams<{ funnelSlug: string }>();
  const navigate = useNavigate();
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Default gallery images as fallback
  const defaultGallery = [
    { id: '1', image_url: gallery1, location: "French Alps", caption: "Skiing adventure in the mountains", sort_order: 0 },
    { id: '2', image_url: gallery2, location: "French Village", caption: "Charming restaurant experience", sort_order: 1 },
    { id: '3', image_url: gallery3, location: "Mexico", caption: "Delicious breakfast overlooking the coast", sort_order: 2 },
    { id: '4', image_url: gallery4, location: "New Orleans", caption: "Historic church in the French Quarter", sort_order: 3 }
  ];

  const travelStories = galleryImages.length > 0 ? galleryImages : defaultGallery;

  const howWeDoIt = [
    {
      title: "We discovered wholesale pricing",
      description: "That first trip showed us we could stay at four- and five-star resorts for what we used to pay for three-star hotels"
    },
    {
      title: "The world opened up",
      description: "Suddenly, those destinations we only dreamed about became real possibilities for us"
    },
    {
      title: "We brought our loved ones",
      description: "Now we're creating memories with our whole family - something we never thought we could afford"
    },
    {
      title: "Travel became our lifestyle",
      description: "We went from one vacation every few years to exploring the world regularly"
    }
  ];

  useEffect(() => {
    const fetchFunnelData = async () => {
      if (!funnelSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch funnel data
      const { data: funnelRecord, error: funnelError } = await supabase
        .from('ambassador_funnels')
        .select('*')
        .eq('funnel_slug', funnelSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (funnelError || !funnelRecord) {
        console.error('Error fetching funnel:', funnelError);
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch associated profile data
      const { data: profileRecord, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, tagline, bio')
        .eq('id', funnelRecord.user_id)
        .maybeSingle();

      if (profileError || !profileRecord) {
        console.error('Error fetching profile:', profileError);
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Combine the data
      const combinedData: FunnelData = {
        ...funnelRecord,
        profiles: profileRecord
      };

      setFunnelData(combinedData);

      // Fetch gallery images
      const { data: galleryData } = await supabase
        .from('funnel_gallery_images')
        .select('*')
        .eq('funnel_id', funnelRecord.id)
        .order('sort_order', { ascending: true });

      if (galleryData && galleryData.length > 0) {
        setGalleryImages(galleryData);
      }

      setLoading(false);

      // Track page view analytics
      await supabase.from('funnel_analytics').insert({
        funnel_id: funnelRecord.id,
        ambassador_id: funnelRecord.user_id,
        event_type: 'page_view',
        event_data: {
          referrer: document.referrer,
          user_agent: navigator.userAgent,
        }
      });
    };

    fetchFunnelData();
  }, [funnelSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !funnelData) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Page Not Found</h1>
          <p className="text-xl text-muted-foreground mb-8">This ambassador page doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const displayName = funnelData.profiles.full_name || 'Your Travel Ambassador';
  const displayHeadline = funnelData.custom_headline || 'Transform Your Travel Dreams Into Reality';
  const displayBio = funnelData.custom_bio || funnelData.profiles.bio || '';
  const displayHeroImage = funnelData.hero_image_url || heroImage;
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section with Ambassador */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${displayHeroImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center py-12 px-6 animate-in fade-in duration-1000">
          {/* Ambassador Avatar */}
          <div className="mb-8">
            <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
              <AvatarImage src={funnelData.profiles.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Headline */}
          <div className="text-center text-white max-w-4xl">
            <p className="text-xl md:text-2xl mb-4 text-white/90 font-medium">
              Hi! I'm {displayName}
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl mb-6">
              {displayHeadline}
            </h1>
            
            <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed mb-8">
              I discovered a way to travel the world at wholesale prices, and I want to share this incredible opportunity with you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-primary hover:bg-white/90 hover:scale-105 shadow-xl text-lg font-bold"
              >
                Show Me How →
              </Button>
              
              {funnelData.vip_join_url && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white !text-white bg-transparent hover:bg-white hover:!text-primary text-lg font-bold"
                  onClick={() => window.open(funnelData.vip_join_url!, '_blank')}
                >
                  Join MWR Now!
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ambassador Story Section */}
      {displayBio && (
        <section className="py-20 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center text-foreground">
              My Story
            </h2>
            
            <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
              {displayBio}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground">
            Places We Never Thought We'd See
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Each photo represents a dream that came true
          </p>
          
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {travelStories.map((story, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden border-border">
                    <div className="relative bg-black flex items-center justify-center" style={{ minHeight: '500px' }}>
                      <img src={story.image_url} alt={story.location} className="max-h-[600px] w-auto object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <h3 className="text-3xl font-bold mb-2">{story.location}</h3>
                        <p className="text-white/90 text-lg leading-relaxed">{story.caption}</p>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* How We Do It Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center text-foreground">
            Here's What Changed for Us
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            The travel membership program we discovered didn't just save us money - it transformed how we live.
          </p>

          <div className="max-w-3xl mx-auto space-y-6">
            {howWeDoIt.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-6 rounded-lg bg-background hover:bg-accent/50 transition-colors">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Lead Form */}
      <section className="py-24 px-6 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to Transform Your Travel Life?
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Get instant access to my exclusive video that reveals exactly how I book luxury travel at wholesale prices.
          </p>
          
          <div id="lead-form" className="scroll-mt-20">
            <LeadCaptureForm 
              funnelSlug={funnelSlug!} 
              source="ambassador_funnel"
            />
          </div>
          
          <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your information is 100% secure. We respect your privacy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Earth Resonance Wellness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Funnel;
