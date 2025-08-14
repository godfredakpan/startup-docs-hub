import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Zap, Users, Database, Lock } from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    description: "Quick setup and basic configuration",
    articles: [
      { title: "Installation", status: "published" },
      { title: "Authentication Setup", status: "coming-soon" },
      { title: "First API Call", status: "published" },
    ]
  },
  {
    title: "Core Concepts",
    description: "Understanding the fundamentals",
    articles: [
      { title: "Documents & Collections", status: "published" },
      { title: "User Management", status: "coming-soon" },
      { title: "Permissions & Roles", status: "coming-soon" },
    ]
  },
  {
    title: "Advanced Features",
    description: "Power user functionality",
    articles: [
      { title: "Custom Themes", status: "published" },
      { title: "Webhooks Integration", status: "coming-soon" },
      { title: "Analytics Dashboard", status: "coming-soon" },
    ]
  }
];

export const DocsSection = ({ content }: any) => {

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to build amazing documentation experiences for your users.
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get up and running in under 5 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Start Tutorial</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>Connect your database for dynamic content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                * Requires Supabase integration
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <CardTitle>User Auth</CardTitle>
              <CardDescription>Secure your docs with authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                * Requires Supabase integration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                <p className="text-muted-foreground">{section.description}</p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.articles.map((article, articleIndex) => (
                  <Card key={articleIndex} className="hover:shadow-soft transition-all duration-300 cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <CardTitle className="text-base">{article.title}</CardTitle>
                        </div>
                        <Badge 
                          variant={article.status === "published" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {article.status === "published" ? "Live" : "Soon"}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Notice */}
        <Card className="mt-16 border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <Database className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to add dynamic content?</h3>
              <p className="text-muted-foreground mb-4">
                Connect to Supabase to enable user authentication, dynamic documentation, and database-driven features.
              </p>
              <Button variant="hero" disabled>
                Connect Database
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Available after Supabase integration
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};