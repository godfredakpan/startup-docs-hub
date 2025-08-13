import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import heroImage from "@/assets/hero-documentation.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient - Mintlify style */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <Badge variant="secondary" className="mb-8 gap-2 bg-card/50 backdrop-blur-sm border-border">
            <Sparkles className="w-4 h-4" />
            The documentation platform of tomorrow
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight">
            The documentation{" "}
            <br className="hidden sm:block" />
            platform of{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              tomorrow
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Meet the next generation of documentation. AI-native, beautiful out-of-the-box, 
            and built for developers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-lg font-medium"
              onClick={() => window.location.href = "/auth"}
            >
              Try for free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-medium border-border bg-transparent">
              Get a demo
            </Button>
          </div>

          {/* Documentation type tabs - Mintlify style */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Badge variant="outline" className="bg-card/30 backdrop-blur-sm">📖 Guides</Badge>
            <Badge variant="outline" className="bg-card/30 backdrop-blur-sm">🤖 AI Chat</Badge>
            <Badge variant="outline" className="bg-card/30 backdrop-blur-sm">📋 API Reference</Badge>
            <Badge variant="outline" className="bg-card/30 backdrop-blur-sm">📚 SDK Library</Badge>
            <Badge variant="outline" className="bg-card/30 backdrop-blur-sm">📝 Changelog</Badge>
          </div>
        </div>

        {/* Hero image with Mintlify-style presentation */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative">
            {/* Floating documentation preview */}
            <div className="relative rounded-2xl overflow-hidden shadow-elegant border border-border/50 bg-card/80 backdrop-blur-sm">
              <img 
                src={heroImage} 
                alt="Documentation platform interface showcasing modern design and intuitive navigation"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
            </div>
            
            {/* Floating elements around the main image */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Feature section - Mintlify style */}
        <div className="mt-32 grid md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-background" />
            </div>
            <h3 className="text-xl font-bold mb-4">Beautiful out of the box</h3>
            <p className="text-muted-foreground leading-relaxed">
              Deploy stunning documentation in minutes with our beautiful, 
              customizable themes that convert visitors into users.
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-background" />
            </div>
            <h3 className="text-xl font-bold mb-4">Built for collaboration</h3>
            <p className="text-muted-foreground leading-relaxed">
              Empower your team with workflows that meet you where you are, 
              whether you prefer git sync or a WYSIWYG experience.
            </p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-8 h-8 text-background" />
            </div>
            <h3 className="text-xl font-bold mb-4">Designed for conversion</h3>
            <p className="text-muted-foreground leading-relaxed">
              Everything is optimized for user discovery and engagement. 
              Analytics help you understand and optimize your audience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};