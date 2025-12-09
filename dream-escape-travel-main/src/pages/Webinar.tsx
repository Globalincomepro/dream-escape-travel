import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Navigation } from '@/components/Navigation';
import { WebinarGetStartedForm } from '@/components/WebinarGetStartedForm';
import { HowToGetStarted } from '@/components/HowToGetStarted';
import { supabase } from '@/integrations/supabase/client';
import { Clock, ChevronDown } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const Webinar = () => {
  const [searchParams] = useSearchParams();
  const playerInstanceRef = useRef<any>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedIntent, setSubmittedIntent] = useState<'join_now' | 'need_info' | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const VIDEO_ID = 'Ca6zzRaFK-A';
  const VIDEO_DURATION = 464; // 7:44 in seconds
  
  // Default ambassador slug for Phase 1
  const DEFAULT_AMBASSADOR_SLUG = 'donna-charles-potter';
  
  // Extract tracking params
  const funnelSlug = searchParams.get('ref') || DEFAULT_AMBASSADOR_SLUG;
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  
  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
    
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player', {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
      playerInstanceRef.current = newPlayer;
    };
    
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
    
    // Track page view
    trackEvent('webinar_page_view');
    
    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  const onPlayerReady = (event: any) => {
    // Player is ready
  };
  
  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      trackEvent('video_started');
      startProgressTracking();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      trackEvent('video_paused', { timestamp: playerInstanceRef.current?.getCurrentTime() });
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    } else if (event.data === window.YT.PlayerState.ENDED) {
      trackEvent('video_completed');
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };
  
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
        const currentTime = playerInstanceRef.current.getCurrentTime();
        setVideoProgress(currentTime);
      }
    }, 1000);
  };
  
  const trackEvent = async (eventType: string, data = {}) => {
    try {
      await supabase.from('funnel_analytics').insert({
        event_type: eventType,
        event_data: {
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          funnel_slug: funnelSlug,
          video_id: VIDEO_ID,
          ...data
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };
  
  const scrollToForm = () => {
    trackEvent('get_started_button_clicked', { timestamp: playerInstanceRef.current?.getCurrentTime() });
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFormSuccess = (intent: string) => {
    setFormSubmitted(true);
    setSubmittedIntent(intent as 'join_now' | 'need_info');
    trackEvent('lead_form_submitted', { intent });
    
    // Track additional event for MWR redirects
    if (intent === 'join_now') {
      trackEvent('mwr_redirect_clicked');
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Path to Travel Freedom
          </h1>
          <p className="text-xl text-muted-foreground">
            Watch this 7-minute training to discover how everyday people are traveling more for less
          </p>
        </div>
        
        {/* Video Player - Fixed height with better aspect ratio */}
        <Card className="overflow-hidden mb-8">
          <div 
            id="youtube-player" 
            ref={playerRef}
            className="aspect-[16/10] w-full"
          />
        </Card>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Video Progress</span>
            </div>
            <span>{formatTime(videoProgress)} / {formatTime(VIDEO_DURATION)}</span>
          </div>
          <Progress value={(videoProgress / VIDEO_DURATION) * 100} className="h-2" />
        </div>
        
        {/* Get Started Now Button */}
        <div className="text-center mb-16">
          <Button
            size="lg"
            onClick={scrollToForm}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-xl py-8 px-12 shadow-xl hover:shadow-2xl"
          >
            Get Started Now
            <ChevronDown className="ml-2 w-6 h-6 animate-bounce" />
          </Button>
        </div>

        {/* Form Section */}
        <div ref={formSectionRef} className="scroll-mt-8">
          <Card className="p-8 md:p-12 mb-16">
            {!formSubmitted ? (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Ready to Start Your Travel Journey?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Fill out the form below and we'll personally reach out to help you book your first trip at wholesale prices.
                  </p>
                </div>
                
                <WebinarGetStartedForm onSuccess={handleFormSuccess} />
              </div>
            ) : submittedIntent ? (
              <HowToGetStarted intent={submittedIntent} />
            ) : null}
          </Card>
        </div>
        
        {/* Info Section */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            Questions? Have a specific destination in mind? Let's talk about how this can work for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Webinar;
