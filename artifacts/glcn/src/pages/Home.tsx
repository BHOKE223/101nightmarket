import { useEffect, useRef } from 'react';
import { SiTiktok } from 'react-icons/si';
import { ArrowRight, Zap, TrendingUp, DollarSign, Star, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const APPLY_LINK = "https://www.tiktok.com/t/ZMhXJ19fV/";

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

export default function Home() {
  const handleApply = () => window.open(APPLY_LINK, "_blank");

  const promiseRef = useFadeIn();
  const storyImgRef = useFadeIn(0.1);
  const storyTextRef = useFadeIn(0.1);
  const whyRef = useFadeIn(0.1);
  const howRef = useFadeIn(0.1);
  const ctaRef = useFadeIn(0.1);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/glcn-logo.webp"
              alt="GLCN – Go Live Creator Network"
              className="h-16 w-auto"
              data-testid="img-glcn-logo-nav"
            />
          </div>
          <Button
            onClick={handleApply}
            size="sm"
            className="rounded-full font-semibold"
            data-testid="button-apply-nav"
          >
            Apply Now
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 min-h-[90vh] flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-0 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10 fade-in is-visible">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm font-medium mb-8">
            <SiTiktok className="w-4 h-4 text-[#ff0050]" />
            <span>Official TikTok Live Agency</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
            Go Live.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Grow Your Brand.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
            Join the creator network that turns ordinary people into streaming stars.
            We build audiences, monetize streams, and launch businesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleApply}
              className="w-full sm:w-auto text-lg h-14 px-8 rounded-full font-bold"
              data-testid="button-apply-hero"
            >
              Apply to Join GLCN <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary" fill="currentColor" /> 15.4k+ Followers
              </span>
              <span className="hidden sm:inline">•</span>
              <span>@golivecn</span>
            </div>
          </div>
        </div>
      </section>

      {/* The GLCN Promise */}
      <section className="py-24 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">The GLCN Edge</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide the blueprint, the coaching, and the network to dominate TikTok Live.
            </p>
          </div>

          <div ref={promiseRef} className="fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full hover:bg-card/80 transition-colors">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Rapid Growth</h3>
                <p className="text-muted-foreground">Stop guessing the algorithm. We use proven strategies to explode your viewership and follower count.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full hover:bg-card/80 transition-colors">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                  <DollarSign className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Monetization</h3>
                <p className="text-muted-foreground">Turn views into revenue. We teach you how to maximize gifts, subscriptions, and brand partnerships.</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full hover:bg-card/80 transition-colors">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <Camera className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Live Production</h3>
                <p className="text-muted-foreground">From lighting and audio to engagement tactics, we upgrade your production value to professional standards.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Story */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div ref={storyImgRef} className="fade-in-left flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] transform -rotate-3 scale-105 z-0" />
              <picture>
                <source srcSet="/chris-bailey.webp" type="image/webp" />
                <img
                  src="/chris-bailey.png"
                  alt="Chris Bailey streaming live at 101nightmarket"
                  className="w-full h-auto rounded-[2rem] relative z-10 border border-border/50 shadow-2xl"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  data-testid="img-chris-bailey"
                />
              </picture>

              <div className="absolute -bottom-6 -right-2 lg:-right-10 z-20 bg-background border border-border p-5 rounded-2xl shadow-xl w-56">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  Success Story
                </div>
                <div className="text-2xl font-black mb-1">12,500+</div>
                <div className="text-sm text-muted-foreground">TikTok Followers built from scratch</div>
              </div>
            </div>

            <div ref={storyTextRef} className="fade-in-right flex-1 space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold tracking-wide uppercase">
                Featured Creator
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                From Zero to LA's Fastest Growing Night Market
              </h2>
              <p className="text-lg text-muted-foreground">
                Chris Bailey joined GLCN with a vision. By leveraging our live streaming playbook, he launched the{' '}
                <strong className="text-foreground">101nightmarket</strong> and built a massive, highly engaged community.
              </p>

              <blockquote className="pl-6 border-l-4 border-primary text-xl italic font-medium my-8">
                "I credit GLCN entirely for my TikTok growth and the explosion of the night market. The coaching changed everything."
                <footer className="text-sm font-normal text-muted-foreground mt-4 flex items-center gap-2 not-italic">
                  <span className="font-bold text-foreground">Chris Bailey</span>
                  <span>•</span>
                  <span>@101nightmarket / @101aguafrescas</span>
                </footer>
              </blockquote>

              <div className="bg-muted/50 rounded-xl p-6 border border-border font-mono text-sm space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">The 101 Night Market</span>
                  <img
                    src="/nightmarket-logo.webp"
                    alt="101 Night Market"
                    className="h-10 w-auto opacity-90"
                    loading="lazy"
                    decoding="async"
                    data-testid="img-nightmarket-logo"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-muted-foreground w-24">Location:</span>
                  <span className="font-semibold">16955 Sherman Way, Van Nuys CA</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-muted-foreground w-24">Hours:</span>
                  <span className="font-semibold">Thurs–Sat, 5PM–10PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-muted-foreground w-24">Content:</span>
                  <span className="font-semibold">311+ Videos Published</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Go Live? */}
      <section className="py-24 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why TikTok Live?</h2>
            <p className="text-muted-foreground text-lg">The most powerful attention engine for modern brands.</p>
          </div>

          <div ref={whyRef} className="fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-border/50">
              <h3 className="text-2xl font-bold mb-4 text-primary">For Creators</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Uncapped earning potential through live gifts and subscriptions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Build a deeply loyal, hyper-engaged community in real time.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>Algorithm favors live streamers for organic feed discovery.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-border/50">
              <h3 className="text-2xl font-bold mb-4 text-secondary">For Businesses</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>Direct-to-consumer sales and real-time product demonstrations.</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>Humanize your brand by interacting face-to-face with customers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span>Drive massive foot traffic to physical retail locations.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three steps to transforming your digital presence.</p>
          </div>

          <div ref={howRef} className="fade-in space-y-8">
            {[
              { num: "01", title: "Apply", desc: "Submit your application to join the network. We review creators and businesses looking for serious growth." },
              { num: "02", title: "Get Coached", desc: "Access our expert playbook. Learn the optimal setup, content strategy, and engagement hacks." },
              { num: "03", title: "Go Live & Grow", desc: "Hit the live button. Build your community, attract gifts, and convert viewers into loyal customers." }
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-6 p-6 rounded-2xl bg-card border border-border/50"
                data-testid={`card-step-${step.num}`}
              >
                <div className="w-14 h-14 rounded-full bg-background border-4 border-primary flex items-center justify-center text-lg font-black shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />

        <div ref={ctaRef} className="fade-in container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
            Ready to Build Your Brand Live?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            The digital stage is waiting. Join GLCN today and start your journey.
          </p>
          <Button
            size="lg"
            onClick={handleApply}
            className="text-xl h-16 px-10 rounded-full font-bold hover:scale-105 transition-transform"
            data-testid="button-apply-cta"
          >
            Apply to Join GLCN <Zap className="ml-3 w-6 h-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-border/50 text-muted-foreground text-sm bg-background">
        <p>© {new Date().getFullYear()} GLCN - Go Live Creator Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
