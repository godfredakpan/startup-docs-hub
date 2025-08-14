import { useState } from "react";
import { ChevronDown, Check, Star, Users, BookOpen, Zap, Shield, ArrowRight, Play, Menu, X, Globe, Code, Palette, BarChart3 } from "lucide-react";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePlan, setActivePlan] = useState("monthly");

  // Navigation Component
  const Header = () => (
    <header className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">DocHub</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">Pricing</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors font-medium">Testimonials</a>
            <a href="#docs" className="text-gray-300 hover:text-white transition-colors font-medium">Docs</a>
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => window.location.href = "/auth"} className="text-gray-300 hover:text-white transition-colors font-medium">Sign In</button>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105">
              Start Free Trial
            </button>
          </div>
          
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors font-medium">Testimonials</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors font-medium">Docs</a>
              <div className="pt-4 border-t border-gray-800">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  // Hero Section
  const HeroSection = () => (
    <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap size={16} />
            <span>New: AI-powered documentation generator</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Beautiful docs that<br />convert visitors into<br />
            <span className="relative text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              customers
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create stunning, interactive documentation that engages users and drives conversions. 
            Built for modern teams who care about user experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-200 hover:scale-105 flex items-center gap-2">
              Start Free Trial
              <ArrowRight size={20} />
            </button>
            <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium border border-gray-700 px-6 py-3 rounded-xl hover:border-gray-600">
              <Play size={20} />
              Watch Demo
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-30"></div>
            <div className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
              <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center text-sm text-gray-400">docs.yourcompany.com</div>
              </div>
              <div className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-gray-600">
                  <BookOpen size={64} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Social Proof Section
  const SocialProofSection = () => (
    <section className="py-12 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-400 mb-8 font-medium">Trusted by 10,000+ companies worldwide</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-40">
          {['TechCorp', 'InnovateLabs', 'DevTools', 'CloudSync', 'DataFlow', 'NextGen'].map((company, index) => (
            <div key={index} className="text-center font-bold text-xl text-gray-500">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Features Section
  const FeaturesSection = () => (
    <section id="features" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Everything you need to create
            <br />world-class documentation
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From beautiful themes to powerful analytics, DocHub provides all the tools you need to create documentation that converts.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Palette className="text-blue-400" size={32} />,
              title: "Beautiful Themes",
              description: "Choose from dozens of professionally designed themes or create your own with our visual editor."
            },
            {
              icon: <Code className="text-purple-400" size={32} />,
              title: "Developer Friendly",
              description: "Write in Markdown, sync with Git, and deploy automatically. Built for developer workflows."
            },
            {
              icon: <BarChart3 className="text-green-400" size={32} />,
              title: "Advanced Analytics",
              description: "Track user engagement, popular pages, and conversion rates with detailed analytics."
            },
            {
              icon: <Globe className="text-orange-400" size={32} />,
              title: "Global CDN",
              description: "Lightning-fast loading times worldwide with our global content delivery network."
            },
            {
              icon: <Users className="text-red-400" size={32} />,
              title: "Team Collaboration",
              description: "Work together seamlessly with real-time editing, comments, and review workflows."
            },
            {
              icon: <Shield className="text-indigo-400" size={32} />,
              title: "Enterprise Security",
              description: "SOC 2 compliant with SSO, advanced permissions, and enterprise-grade security."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-1 group">
              <div className="mb-4 group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Testimonials Section
  const TestimonialsSection = () => (
    <section id="testimonials" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Loved by teams everywhere
          </h2>
          <p className="text-xl text-gray-300">See what our customers have to say about DocHub</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "DocHub transformed our documentation from a necessary evil into our best marketing asset. Our trial-to-paid conversion rate increased by 40%.",
              author: "Sarah Chen",
              role: "Head of Product",
              company: "TechFlow",
              rating: 5
            },
            {
              quote: "The analytics insights helped us identify which parts of our docs were confusing users. We improved our onboarding flow and reduced support tickets by 60%.",
              author: "Marcus Rodriguez",
              role: "Developer Relations",
              company: "CloudAPI",
              rating: 5
            },
            {
              quote: "Beautiful, fast, and incredibly easy to maintain. Our documentation finally reflects the quality of our product.",
              author: "Emily Watson",
              role: "Engineering Manager",
              company: "DataSync",
              rating: 5
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:-translate-y-1">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>
              <div>
                <div className="font-semibold text-white">{testimonial.author}</div>
                <div className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Pricing Section
  const PricingSection = () => (
    <section id="pricing" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-300 mb-8">Choose the perfect plan for your team</p>
          
          <div className="inline-flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button 
              className={`px-6 py-2 rounded-md font-medium transition-all ${activePlan === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActivePlan('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`px-6 py-2 rounded-md font-medium transition-all ${activePlan === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActivePlan('yearly')}
            >
              Yearly <span className="text-green-400 text-xs font-bold ml-1">-20%</span>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: activePlan === 'monthly' ? 29 : 23,
              description: "Perfect for small teams getting started",
              features: [
                "Up to 5 team members",
                "10 documentation sites",
                "Basic analytics",
                "Community support",
                "Custom domain",
                "SSL certificate"
              ],
              cta: "Start Free Trial",
              popular: false
            },
            {
              name: "Professional",
              price: activePlan === 'monthly' ? 79 : 63,
              description: "For growing teams that need more power",
              features: [
                "Up to 25 team members",
                "Unlimited documentation sites",
                "Advanced analytics",
                "Priority support",
                "Custom branding",
                "API access",
                "Advanced permissions",
                "SSO integration"
              ],
              cta: "Start Free Trial",
              popular: true
            },
            {
              name: "Enterprise",
              price: "Custom",
              description: "For large organizations with specific needs",
              features: [
                "Unlimited team members",
                "Unlimited everything",
                "White-label solution",
                "Dedicated support",
                "Custom integrations",
                "On-premise deployment",
                "SLA guarantee",
                "Training & onboarding"
              ],
              cta: "Contact Sales",
              popular: false
            }
          ].map((plan, index) => (
            <div key={index} className={`bg-gray-800 p-8 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-1 ${plan.popular ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-gray-700 hover:border-gray-600'}`}>
              {plan.popular && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <div className="mb-4">
                {typeof plan.price === 'number' ? (
                  <div>
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-white">{plan.price}</div>
                )}
              </div>
              <p className="text-gray-400 mb-8">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check size={20} className="text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-400">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </div>
    </section>
  );

  // CTA Section
  const CTASection = () => (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to transform your documentation?
        </h2>
        <p className="text-xl text-blue-100 mb-10">
          Join thousands of companies using DocHub to create documentation that converts visitors into customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
            Get Started
            <ArrowRight size={20} />
          </button>
          <button className="text-white hover:text-blue-100 transition-colors font-medium flex items-center gap-2 border border-white/30 px-6 py-3 rounded-xl hover:border-white/50">
            <Play size={20} />
            Schedule Demo
          </button>
        </div>
      </div>
    </section>
  );

  // Footer
  const Footer = () => (
    <footer className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">DocHub</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Beautiful documentation that converts visitors into users. Built for modern teams who care about user experience.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="font-bold">T</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="font-bold">L</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="font-bold">G</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} DocHub. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-gray-400 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <HeroSection />
        <SocialProofSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;