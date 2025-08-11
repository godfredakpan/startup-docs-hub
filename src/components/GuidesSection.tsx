import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Rocket, Code, Database, Shield } from "lucide-react";

const guides = [
  {
    category: "Setup & Configuration",
    icon: Rocket,
    color: "bg-blue-500",
    guides: [
      { title: "Setting up your first documentation site", difficulty: "Beginner", time: "10 min" },
      { title: "Customizing themes and branding", difficulty: "Beginner", time: "15 min" },
      { title: "Organizing your content structure", difficulty: "Intermediate", time: "20 min" },
    ]
  },
  {
    category: "User Management",
    icon: Users,
    color: "bg-green-500",
    guides: [
      { title: "Setting up user authentication", difficulty: "Intermediate", time: "30 min", requiresDb: true },
      { title: "Managing user roles and permissions", difficulty: "Advanced", time: "25 min", requiresDb: true },
      { title: "Creating team workspaces", difficulty: "Advanced", time: "35 min", requiresDb: true },
    ]
  },
  {
    category: "Advanced Features",
    icon: Code,
    color: "bg-purple-500",
    guides: [
      { title: "Building custom API documentation", difficulty: "Intermediate", time: "40 min" },
      { title: "Integrating with external services", difficulty: "Advanced", time: "45 min", requiresDb: true },
      { title: "Creating interactive demos", difficulty: "Advanced", time: "60 min" },
    ]
  },
  {
    category: "Database Integration",
    icon: Database,
    color: "bg-orange-500",
    guides: [
      { title: "Connecting your Supabase database", difficulty: "Beginner", time: "15 min", requiresDb: true },
      { title: "Creating dynamic content with RLS", difficulty: "Intermediate", time: "35 min", requiresDb: true },
      { title: "Building real-time collaborative docs", difficulty: "Advanced", time: "60 min", requiresDb: true },
    ]
  }
];

export const GuidesSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Guides & Tutorials</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Step-by-step tutorials to help you build amazing documentation experiences.
          </p>
        </div>

        <div className="space-y-12">
          {guides.map((category, index) => (
            <div key={index}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.guides.map((guide, guideIndex) => (
                  <Card 
                    key={guideIndex} 
                    className={`hover:shadow-soft transition-all duration-300 cursor-pointer ${
                      guide.requiresDb ? 'border-dashed border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-800' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <BookOpen className="w-5 h-5 text-muted-foreground mt-1" />
                        <div className="flex gap-2">
                          <Badge 
                            variant={guide.difficulty === "Beginner" ? "default" : 
                                   guide.difficulty === "Intermediate" ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {guide.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {guide.time}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">{guide.title}</CardTitle>
                      {guide.requiresDb && (
                        <div className="flex items-center gap-2 mt-2">
                          <Shield className="w-4 h-4 text-orange-500" />
                          <span className="text-xs text-orange-600 dark:text-orange-400">
                            Requires database integration
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant={guide.requiresDb ? "outline" : "default"} 
                        className="w-full"
                        disabled={guide.requiresDb}
                      >
                        {guide.requiresDb ? "Coming Soon" : "Start Guide"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Database Integration CTA */}
        <Card className="mt-16 border-dashed border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Unlock Advanced Features</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your documentation platform to Supabase to enable user authentication, 
                dynamic content, and real-time collaboration features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" disabled>
                  Connect Supabase
                </Button>
                <Button variant="outline">
                  Learn More
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                🔒 Secure • 🚀 Fast • 🔄 Real-time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};