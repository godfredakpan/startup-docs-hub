import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, GitCommit, Star, Zap, Bug, Plus } from "lucide-react";

const changelogEntries = [
  {
    version: "v2.4.0",
    date: "2024-01-15",
    type: "feature",
    title: "Advanced API Documentation Generator",
    description: "Automatically generate beautiful API docs from your OpenAPI specs with interactive examples and code snippets.",
    items: [
      "Interactive API explorer with real-time testing",
      "Auto-sync with GitHub repositories",
      "Custom branding and theming options",
      "Multi-language code examples"
    ]
  },
  {
    version: "v2.3.2",
    date: "2024-01-10",
    type: "improvement",
    title: "Enhanced Search & Navigation",
    description: "Improved search functionality with AI-powered suggestions and faster navigation.",
    items: [
      "AI-powered search suggestions",
      "Keyboard shortcuts for power users",
      "Improved mobile navigation",
      "Better search result ranking"
    ]
  },
  {
    version: "v2.3.1",
    date: "2024-01-05",
    type: "fix",
    title: "Bug Fixes & Performance",
    description: "Critical bug fixes and performance improvements across the platform.",
    items: [
      "Fixed rendering issues on mobile devices",
      "Improved page load times by 40%",
      "Fixed authentication edge cases",
      "Better error handling and reporting"
    ]
  }
];

const getIcon = (type: string) => {
  switch (type) {
    case "feature":
      return <Star className="w-4 h-4" />;
    case "improvement":
      return <Zap className="w-4 h-4" />;
    case "fix":
      return <Bug className="w-4 h-4" />;
    default:
      return <Plus className="w-4 h-4" />;
  }
};

const getBadgeVariant = (type: string) => {
  switch (type) {
    case "feature":
      return "default";
    case "improvement":
      return "secondary";
    case "fix":
      return "destructive";
    default:
      return "outline";
  }
};

export const ChangelogSection = ({ content }: any) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What's new in DocHub
          </h2>
          <p className="text-xl text-muted-foreground">
            Stay up to date with the latest features, improvements, and bug fixes.
          </p>
        </div>

        <div className="space-y-8">
          {changelogEntries.map((entry, index) => (
            <Card key={entry.version} className="relative overflow-hidden hover:shadow-soft transition-all duration-300">
              {/* Timeline line */}
              {index !== changelogEntries.length - 1 && (
                <div className="absolute left-6 top-16 w-px h-full bg-border" />
              )}
              
              <CardHeader className="relative">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white shrink-0 relative z-10">
                    <GitCommit className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Badge variant={getBadgeVariant(entry.type)} className="gap-1">
                        {getIcon(entry.type)}
                        {entry.type}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">
                        {entry.version}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <CardTitle className="text-xl mb-2">{entry.title}</CardTitle>
                    <CardDescription className="text-base">{entry.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="ml-12">
                <ul className="space-y-2">
                  {entry.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};