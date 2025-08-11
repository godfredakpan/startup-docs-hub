import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import heroImage from "@/assets/hero-documentation.jpg";

export const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 gap-2">
            <Sparkles className="w-4 h-4" />
            Trusted by 1000+ startups
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Beautiful docs that{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              convert visitors
            </span>{" "}
            into users
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Create stunning documentation, API references, and changelogs that help your users succeed. 
            Built for modern startups who care about developer experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="lg" className="gap-2">
              Start building for free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              View live demo
            </Button>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">Deploy documentation in minutes, not days. Our platform is optimized for speed.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Ready</h3>
            <p className="text-muted-foreground">SOC 2 compliant with advanced security features and team collaboration tools.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground">Smart suggestions and automated improvements to make your docs shine.</p>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-elegant border">
            <img 
              src={heroImage} 
              alt="Documentation platform interface"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};