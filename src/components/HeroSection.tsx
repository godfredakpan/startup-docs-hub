import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import heroImage from "@/assets/hero-documentation.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Mintlify-style background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,hsl(160_100%_95%)_120%)]" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="mb-8">
          <Badge variant="secondary" className="gap-2 bg-white/80 backdrop-blur-sm border border-gray-200">
            <Sparkles className="w-4 h-4" />
            Powering experiences from next-gen startups to enterprises
          </Badge>
        </div>
        
        {/* Main headline - Mintlify style */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
          The documentation{" "}
          <br />
          platform of{" "}
          <span className="text-black">tomorrow</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
          Meet the next generation of documentation. AI-native, beautiful out-of-the-box, 
          and built for developers.
        </p>
        
        {/* CTA Buttons - Mintlify style */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg font-medium rounded-lg"
            onClick={() => window.location.href = "/auth"}
          >
            Try for free
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-4 text-lg font-medium border-gray-300 bg-white hover:bg-gray-50 rounded-lg"
          >
            Get a demo
          </Button>
        </div>

        {/* Documentation type indicators - Mintlify style */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700">📖 Guides</Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700">🤖 AI Chat</Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700">📋 API Reference</Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700">📚 SDK Library</Badge>
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700">📝 Changelog</Badge>
        </div>

        {/* Hero image - Mintlify style with clean presentation */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
              <img 
                src={heroImage} 
                alt="Documentation platform interface showcasing modern design and intuitive navigation"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Feature highlights section - Mintlify style */}
        <div className="mt-32 grid md:grid-cols-3 gap-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-mint rounded-xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Beautiful out of the box</h3>
            <p className="text-gray-600 leading-relaxed">
              Deploy stunning documentation in minutes with our beautiful, 
              customizable themes.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-mint rounded-xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Built for collaboration</h3>
            <p className="text-gray-600 leading-relaxed">
              Empower your team with workflows that meet you where you are.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-mint rounded-xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Designed for conversion</h3>
            <p className="text-gray-600 leading-relaxed">
              Everything is optimized for user discovery and engagement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};