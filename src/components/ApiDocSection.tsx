import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, Play } from "lucide-react";

const apiEndpoints = [
  {
    method: "GET",
    endpoint: "/api/v1/documents",
    title: "List Documents",
    description: "Retrieve a list of all documents in your workspace.",
    parameters: [
      { name: "page", type: "integer", description: "Page number for pagination" },
      { name: "limit", type: "integer", description: "Number of items per page (max 100)" },
      { name: "search", type: "string", description: "Search query to filter documents" }
    ],
    response: {
      "data": [
        {
          "id": "doc_123",
          "title": "Getting Started Guide",
          "slug": "getting-started",
          "status": "published",
          "created_at": "2024-01-15T10:30:00Z",
          "updated_at": "2024-01-15T14:22:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 42,
        "has_more": true
      }
    }
  },
  {
    method: "POST",
    endpoint: "/api/v1/documents",
    title: "Create Document",
    description: "Create a new document in your workspace.",
    parameters: [
      { name: "title", type: "string", description: "Document title (required)" },
      { name: "content", type: "string", description: "Document content in Markdown" },
      { name: "slug", type: "string", description: "URL slug (auto-generated if not provided)" }
    ],
    response: {
      "id": "doc_456",
      "title": "API Reference",
      "slug": "api-reference",
      "status": "draft",
      "created_at": "2024-01-15T16:45:00Z",
      "updated_at": "2024-01-15T16:45:00Z"
    }
  }
];

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "POST":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "PUT":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "DELETE":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export const ApiDocSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            API Documentation
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive API reference with interactive examples and real-time testing.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {apiEndpoints.map((endpoint, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                    {endpoint.endpoint}
                  </code>
                </div>
                <CardTitle className="text-xl">{endpoint.title}</CardTitle>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Parameters */}
                <div>
                  <h4 className="font-semibold mb-3">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.parameters.map((param, paramIndex) => (
                      <div key={paramIndex} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <code className="text-sm font-mono text-primary">{param.name}</code>
                        <Badge variant="outline" className="text-xs">{param.type}</Badge>
                        <span className="text-sm text-muted-foreground flex-1">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Response</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Play className="w-4 h-4" />
                        Try it
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="json" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="json">JSON</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="json" className="mt-4">
                      <div className="bg-hsl(var(--doc-code-bg)) p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
                          <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="curl" className="mt-4">
                      <div className="bg-hsl(var(--doc-code-bg)) p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
                          <code>{`curl -X ${endpoint.method} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  https://api.dochub.com${endpoint.endpoint}`}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="javascript" className="mt-4">
                      <div className="bg-hsl(var(--doc-code-bg)) p-4 rounded-lg overflow-x-auto">
                        <pre className="text-sm">
                          <code>{`const response = await fetch('https://api.dochub.com${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View Full API Reference
          </Button>
        </div>
      </div>
    </section>
  );
};