import React from 'react';
import { motion } from 'framer-motion';
import { SiTiktok } from 'react-icons/si';
import { ArrowRight, Zap, TrendingUp, DollarSign, Star, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const APPLY_LINK = "https://www.tiktok.com/t/ZMhXJ19fV/";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function Home() {
  const handleApply = () => {
    window.open(APPLY_LINK, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">GLCN</span>
          </div>
          <Button onClick={handleApply} size="sm" className="rounded-full font-semibold">
            Apply Now
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 min-h-[90vh] flex flex-col justify-center relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm font-medium mb-8"
          >
            <SiTiktok className="w-4 h-4 text-[#ff0050]" />
            <span>Official TikTok Live Agency</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.1]"
          >
            Go Live.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Grow Your Brand.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium"
          >
            Join the creator network that turns ordinary people into streaming stars. 
            We build audiences, monetize streams, and launch businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              onClick={handleApply}
              className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-[0_0_40px_rgba(var(--primary),0.5)] hover:shadow-[0_0_60px_rgba(var(--primary),0.7)] transition-all font-bold"
            >
              Apply to Join GLCN <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-primary" fill="currentColor"/> 15.4k+ Followers</span>
              <span className="hidden sm:inline">•</span>
              <span>@golivecn</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The GLCN Promise */}
      <section className="py-24 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">The GLCN Edge</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We provide the blueprint, the coaching, and the network to dominate TikTok Live.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full hover:bg-card/80 transition-colors">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Rapid Growth</h3>
                  <p className="text-muted-foreground">Stop guessing the algorithm. We use proven strategies to explode your viewership and follower count.</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full hover:bg-card/80 transition-colors">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                    <DollarSign className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Monetization</h3>
                  <p className="text-muted-foreground">Turn views into revenue. We teach you how to maximize gifts, subscriptions, and brand partnerships.</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm h-full hover:bg-card/80 transition-colors">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                    <Camera className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Live Production</h3>
                  <p className="text-muted-foreground">From lighting and audio to engagement tactics, we upgrade your production value to professional standards.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Success Story */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1 w-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] transform -rotate-3 scale-105 z-0" />
              <img 
                src="/chris-bailey.png" 
                alt="Chris Bailey streaming at 101nightmarket" 
                className="w-full h-auto rounded-[2rem] relative z-10 border border-border/50 shadow-2xl"
              />
              
              <div className="absolute -bottom-6 -right-6 lg:-right-10 z-20 bg-background border border-border p-6 rounded-2xl shadow-xl w-64">
                <div className="flex items-center gap-2 text-primary font-bold mb-2">
                  <Star className="w-5 h-5 fill-current" />
                  Success Story
                </div>
                <div className="text-2xl font-black mb-1">12,500+</div>
                <div className="text-sm text-muted-foreground">TikTok Followers built from scratch</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1 space-y-6"
            >
              <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold tracking-wide uppercase">
                Featured Creator
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                From Zero to LA's Fastest Growing Night Market
              </h2>
              <p className="text-lg text-muted-foreground">
                Chris Bailey joined GLCN with a vision. By leveraging our live streaming playbook, he launched the <strong className="text-foreground">101nightmarket</strong> and built a massive, highly engaged community.
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
            </motion.div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
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
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-card border border-border/50"
            >
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
            </motion.div>
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

          <div className="space-y-8 relative">
            {/* Connecting line */}
            <div className="absolute left-[27px] md:left-1/2 top-4 bottom-4 w-0.5 bg-border -translate-x-1/2 hidden md:block" />

            {[
              { num: "01", title: "Apply", desc: "Submit your application to join the network. We review creators and businesses looking for serious growth." },
              { num: "02", title: "Get Coached", desc: "Access our expert playbook. Learn the optimal setup, content strategy, and engagement hacks." },
              { num: "03", title: "Go Live & Grow", desc: "Hit the live button. Build your community, attract gifts, and convert viewers into loyal customers." }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center relative z-10 ${idx % 2 === 1 ? 'md:flex-row-reverse text-left md:text-right' : ''}`}
              >
                <div className={`flex-1 ${idx % 2 === 1 ? 'md:pr-12' : 'md:pl-12 order-last md:order-first'} hidden md:block`}>
                  {idx % 2 === 0 ? <div className="text-right">
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div> : null}
                </div>
                
                <div className="w-14 h-14 rounded-full bg-background border-4 border-primary flex items-center justify-center text-xl font-black shrink-0 relative z-10 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  {step.num}
                </div>

                <div className={`flex-1 ${idx % 2 === 1 ? 'md:pl-12 order-last' : 'md:pr-12'}`}>
                  {idx % 2 === 1 || true ? <div className="md:hidden block mb-6">
                     <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                     <p className="text-muted-foreground">{step.desc}</p>
                  </div> : null}
                  {idx % 2 === 1 ? <div className="hidden md:block text-left">
                     <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                     <p className="text-muted-foreground">{step.desc}</p>
                  </div> : null}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.15)_0%,transparent_70%)]" />
        
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tight"
          >
            Ready to Build Your Brand Live?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-12"
          >
            The digital stage is waiting. Join GLCN today and start your journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              size="lg" 
              onClick={handleApply}
              className="text-xl h-16 px-10 rounded-full shadow-[0_0_50px_rgba(var(--primary),0.6)] hover:shadow-[0_0_80px_rgba(var(--primary),0.8)] hover:scale-105 transition-all font-bold"
            >
              Apply to Join GLCN <Zap className="ml-3 w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-border/50 text-muted-foreground text-sm bg-background">
        <p>© {new Date().getFullYear()} GLCN - Go Live Creator Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
