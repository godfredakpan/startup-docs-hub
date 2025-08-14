import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Settings, 
  Eye, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight,
  Home,
  Globe,
  Lock,
  Code,
  Copy,
  Play,
  ExternalLink,
  Search,
  Download,
  Upload,
  History,
  BookOpen,
  Zap,
  AlertTriangle,
  Check,
  X,
  MoreVertical,
  Archive,
  Star,
  Tag,
  Users,
  Calendar,
  Activity,
  Bookmark,
  Filter,
  SortAsc,
  SortDesc,
  Layers,
  Move,
  Palette,
  Type,
  Image as ImageIcon,
  Link,
  Bold,
  Italic,
  List,
  Heading,
  Quote,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RefreshCw,
  Share,
  Clock,
  User as UserIcon,
  Trash,
  DeleteIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface DocumentationProject {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  description?: string;
  template_type: string;
  is_public: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentPage {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  content?: string;
  order_index: number;
  parent_id?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const ProjectEditor = () => {
    
  const { projectId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<DocumentationProject | null>(null);
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<DocumentPage | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'analytics'>('content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Enhanced state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('write');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  const [apiEndpoints, setApiEndpoints] = useState([]);
  const [activeEndpointIndex, setActiveEndpointIndex] = useState(0);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Check if this is an API documentation page based on template_type
  const isApiDoc = project?.template_type === 'api-docs';

  const navigate = useNavigate();
  const { toast } = useToast();

  // Form states
  const [projectSettings, setProjectSettings] = useState({
    title: "",
    slug: "",
    description: "",
    is_public: false,
    cover_image_url: ""
  });

  const [pageContent, setPageContent] = useState({
    title: "",
    slug: "",
    content: "",
    is_published: false
  });

  // Toggle sidebar based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Load API endpoints from content
  useEffect(() => {
    if (isApiDoc && selectedPage?.content) {
      try {
        const content = JSON.parse(selectedPage.content);
        if (Array.isArray(content)) {
          setApiEndpoints(content);
        } else {
          setApiEndpoints([]);
        }
      } catch {
        setApiEndpoints([]);
      }
    } else {
      setApiEndpoints([]);
    }
  }, [selectedPage, isApiDoc]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && selectedPage) {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
      
      autoSaveInterval.current = setTimeout(() => {
        handleSavePage();
      }, 10000);
    }

    return () => {
      if (autoSaveInterval.current) {
        clearTimeout(autoSaveInterval.current);
      }
    };
  }, [pageContent, hasUnsavedChanges, autoSaveEnabled, selectedPage]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProjectData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await (supabase as any)
        .from('documentation_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      setProject(projectData);
      setProjectSettings({
        title: projectData.title,
        slug: projectData.slug,
        description: projectData.description || "",
        is_public: projectData.is_public,
        cover_image_url: projectData.cover_image_url || ""
      });

      // Fetch project pages
      const { data: pagesData, error: pagesError } = await (supabase as any)
        .from('documentation_pages')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (pagesError && pagesError.code !== 'PGRST116') {
        throw pagesError;
      }

      setPages(pagesData || []);

      // Select first page if available
      if (pagesData && pagesData.length > 0) {
        setSelectedPage(pagesData[0]);
        setPageContent({
          title: pagesData[0].title,
          slug: pagesData[0].slug,
          content: pagesData[0].content || "",
          is_published: pagesData[0].is_published
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading project",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!project) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('documentation_projects')
        .update(projectSettings)
        .eq('id', project.id);

      if (error) throw error;

      setProject({ ...project, ...projectSettings });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      toast({
        title: "Project updated",
        description: "Your project settings have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;

    setSaving(true);
    try {
      let contentToSave = pageContent.content;
      
      // If it's API doc, save the endpoints as JSON
      if (isApiDoc) {
        contentToSave = JSON.stringify(apiEndpoints, null, 2);
      }

      const { error } = await (supabase as any)
        .from('documentation_pages')
        .update({
          title: pageContent.title,
          slug: pageContent.slug,
          content: contentToSave,
          is_published: pageContent.is_published
        })
        .eq('id', selectedPage.id);

      if (error) throw error;

      // Update local state
      const updatedPage = { 
        ...selectedPage, 
        ...pageContent,
        content: contentToSave
      };
      setSelectedPage(updatedPage);
      setPages(pages.map(p => p.id === selectedPage.id ? updatedPage : p));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      toast({
        title: "Page saved",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving page",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // API Documentation specific functions
  const addApiEndpoint = () => {
    const newEndpoint = {
      method: "GET",
      endpoint: "/api/v1/new-endpoint",
      title: "New Endpoint",
      description: "Describe what this endpoint does",
      parameters: [],
      response: {
        "id": "doc_456",
        "title": "API Reference",
        "slug": "api-reference",
      }
    };
    setApiEndpoints([...apiEndpoints, newEndpoint]);
    setActiveEndpointIndex(apiEndpoints.length);
    setHasUnsavedChanges(true);
  };

  const updateApiEndpoint = (index: number, field: string, value: any) => {
    const updatedEndpoints = [...apiEndpoints];
    updatedEndpoints[index] = {
      ...updatedEndpoints[index],
      [field]: value
    };
    setApiEndpoints(updatedEndpoints);
    setHasUnsavedChanges(true);
  };

  const addParameterToEndpoint = (index: number) => {
    const updatedEndpoints = [...apiEndpoints];
    updatedEndpoints[index].parameters = [
      ...updatedEndpoints[index].parameters,
      { name: "", type: "", description: "" }
    ];
    setApiEndpoints(updatedEndpoints);
    setHasUnsavedChanges(true);
  };

  const updateParameter = (endpointIndex: number, paramIndex: number, field: string, value: string) => {
    const updatedEndpoints = [...apiEndpoints];
    updatedEndpoints[endpointIndex].parameters[paramIndex] = {
      ...updatedEndpoints[endpointIndex].parameters[paramIndex],
      [field]: value
    };
    setApiEndpoints(updatedEndpoints);
    setHasUnsavedChanges(true);
  };

  const removeParameter = (endpointIndex: number, paramIndex: number) => {
    const updatedEndpoints = [...apiEndpoints];
    updatedEndpoints[endpointIndex].parameters.splice(paramIndex, 1);
    setApiEndpoints(updatedEndpoints);
    setHasUnsavedChanges(true);
  };

  const deleteApiEndpoint = (index: number) => {
    const updated = [...apiEndpoints];
    updated.splice(index, 1);
    setApiEndpoints(updated);
    setActiveEndpointIndex(Math.max(0, index - 1));
    setHasUnsavedChanges(true);
  };

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
      case "PATCH":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleCreatePage = async () => {
    if (!project) return;

    try {
      const { data, error } = await (supabase as any)
        .from('documentation_pages')
        .insert([{
          project_id: project.id,
          title: "New Page",
          slug: `new-page-${Date.now()}`,
          content: "# New Page\n\nStart writing your content here...",
          order_index: pages.length,
          is_published: false
        }])
        .select()
        .single();

      if (error) throw error;

      const newPage = data;
      setPages([...pages, newPage]);
      setSelectedPage(newPage);
      setPageContent({
        title: newPage.title,
        slug: newPage.slug,
        content: newPage.content || "",
        is_published: newPage.is_published
      });

      toast({
        title: "Page created",
        description: "New page added to your documentation.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating page",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePage = async () => {
    try {
        
      const { error } = await (supabase as any)
        .from('documentation_pages')
        .delete()
        .eq('id', selectedPage?.id)
        .select('id')

      if (error) throw error;

      const updatedPages = pages.filter((page) => page.id !== selectedPage?.id);
      setPages(updatedPages);
      setSelectedPage(updatedPages.length > 0 ? updatedPages[0] : null);
      setPageContent({
        title: updatedPages.length > 0 ? updatedPages[0].title : "",
        slug: updatedPages.length > 0 ? updatedPages[0].slug : "",
        content: updatedPages.length > 0 ? updatedPages[0].content || "" : "",
        is_published: updatedPages.length > 0 ? updatedPages[0].is_published : false
      });

      toast({
        title: "Page deleted",
        description: "The selected page has been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting page",
        description: error.message,
        variant: "destructive",
      });
    }
      
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleTemplateInsert = (template) => {
    setPageContent((prev) => ({
      ...prev,
      content: prev.content + "\n\n" + template.content,
    }));
    setHasUnsavedChanges(true);
    toast({
      title: "Template inserted",
      description: `"${template.name}" has been added to the editor.`,
    });
  };

  // Enhanced templates
  const templates = [
    {
      name: "Getting Started",
      icon: "🚀",
      content: "# Getting Started\n\n## Overview\n\nWelcome to our documentation! This guide will help you get up and running quickly.\n\n## Prerequisites\n\nBefore you begin, ensure you have:\n\n- Node.js 16+ installed\n- A valid API key\n- Basic understanding of REST APIs\n\n## Quick Start\n\n1. Install the SDK\n2. Configure your credentials\n3. Make your first API call"
    },
    {
      name: "API Reference",
      icon: "📚",
      content: "# API Reference\n\n## Base URL\n\n```\nhttps://api.example.com/v1\n```\n\n## Authentication\n\nAll API requests require authentication using API keys.\n\n## Rate Limiting\n\nAPI requests are limited to 1000 requests per hour.\n\n## Response Format\n\nAll responses are returned in JSON format."
    },
    {
      name: "FAQ Section",
      icon: "❓",
      content: "# Frequently Asked Questions\n\n## General Questions\n\n### What is this service?\n\nOur service provides...\n\n### How do I get started?\n\nTo get started, you need to...\n\n## Technical Questions\n\n### What are the rate limits?\n\nAPI requests are limited to...\n\n### How do I authenticate?\n\nAuthentication is handled via..."
    },
    {
      name: "Changelog",
      icon: "📝",
      content: "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n## [Unreleased]\n\n### Added\n- New feature descriptions\n\n### Changed\n- Updated existing functionality\n\n### Fixed\n- Bug fixes and improvements\n\n## [1.0.0] - 2024-01-01\n\n### Added\n- Initial release"
    },
    {
      name: "Code Example",
      icon: "💻",
      content: "# Code Examples\n\n## JavaScript\n\n```javascript\nconst response = await fetch('https://api.example.com/v1/data', {\n  method: 'GET',\n  headers: {\n    'Authorization': 'Bearer YOUR_TOKEN'\n  }\n});\n\nconst data = await response.json();\nconsole.log(data);\n```\n\n## Python\n\n```python\nimport requests\n\nresponse = requests.get(\n    'https://api.example.com/v1/data',\n    headers={'Authorization': 'Bearer YOUR_TOKEN'}\n)\n\ndata = response.json()\nprint(data)\n```"
    }
  ];

  // Utility functions
  const formatLastSaved = () => {
    if (!lastSaved) return "Never";
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    return `${minutes} minutes ago`;
  };

  // Filtered pages based on search
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const JsonEditor = ({ value, onChange }: { value: any; onChange: (value: any) => void }) => {
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Initialize with formatted JSON
    useEffect(() => {
      try {
        setText(JSON.stringify(value, null, 2));
        setError(null);
      } catch {
        setText("");
        setError("Invalid JSON data");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setHasUnsavedChanges(true);
        };

        const handleBlur = () => {
        try {
            const parsed = JSON.parse(text);
            onChange(parsed);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
        }
        };

    const handleFormat = () => {
      try {
        const parsed = JSON.parse(text);
        setText(JSON.stringify(parsed, null, 2));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid JSON");
      }
    };
    

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection="projects" 
        onSectionChange={() => {}} 
        user={user}
        onSignOut={handleSignOut}
      />
      
      {/* Enhanced status bar */}
      <div className="h-8 bg-muted/30 border-b flex items-center justify-between px-4 md:px-6 text-xs">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            {saving ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <AlertTriangle className="w-3 h-3 text-orange-500" />
                <span className="hidden sm:inline">Unsaved changes</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-green-500" />
                <span className="hidden sm:inline">Saved {formatLastSaved()}</span>
              </>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-1 text-muted-foreground">
            <FileText className="w-3 h-3" />
            {pages.length} pages
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="hidden md:inline text-muted-foreground">View:</span>
            <div className="flex bg-background rounded p-0.5 border">
              {[
                { mode: 'desktop', icon: Monitor },
                { mode: 'tablet', icon: Tablet },
                { mode: 'mobile', icon: Smartphone }
              ].map(({ mode, icon: Icon }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode as any)}
                  className="p-1 h-6 w-6"
                >
                  <Icon className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 h-6 text-xs hidden sm:flex"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3 mr-1" /> : <Maximize2 className="w-3 h-3 mr-1" />}
            {isFullscreen ? 'Exit' : 'Focus'}
          </Button>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-96px)]">
        {/* Mobile Sidebar Drawer */}
        <Drawer open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <DrawerContent className="h-[90%]">
            <div className="p-4">
              {/* Mobile sidebar content - same as desktop but condensed */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{project?.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex bg-muted rounded-lg p-1 mb-4">
                <Button
                  variant={activeTab === 'content' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('content');
                    setMobileSidebarOpen(false);
                  }}
                  className="flex-1"
                >
                  <FileText className="w-3 h-3" />
                </Button>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('settings');
                    setMobileSidebarOpen(false);
                  }}
                  className="flex-1"
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('analytics');
                    setMobileSidebarOpen(false);
                  }}
                  className="flex-1"
                >
                  <Activity className="w-3 h-3" />
                </Button>
              </div>
              
              {activeTab === 'content' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Pages</h3>
                    <Button size="sm" onClick={handleCreatePage}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {filteredPages.map((page) => (
                      <Card
                        key={page.id}
                        className={`cursor-pointer ${selectedPage?.id === page.id ? 'border-primary' : ''}`}
                        onClick={() => {
                          setSelectedPage(page);
                          setPageContent({
                            title: page.title,
                            slug: page.slug,
                            content: page.content || "",
                            is_published: page.is_published
                          });
                          setMobileSidebarOpen(false);
                        }}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm truncate">{page.title}</CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <Label>Project Title</Label>
                    <Input
                      value={projectSettings.title}
                      onChange={(e) => setProjectSettings(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Public Access</Label>
                    <Switch
                      checked={projectSettings.is_public}
                      onCheckedChange={(checked) => setProjectSettings(prev => ({ ...prev, is_public: checked }))}
                    />
                  </div>
                  
                  <Button onClick={handleSaveProject} className="w-full">
                    Save Settings
                  </Button>
                </div>
              )}
              
              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Card>
                      <CardHeader className="p-2">
                        <CardTitle className="text-sm">Total Pages</CardTitle>
                        <CardDescription className="text-lg font-bold">
                          {pages.length}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-2">
                        <CardTitle className="text-sm">Published</CardTitle>
                        <CardDescription className="text-lg font-bold text-green-600">
                          {pages.filter(p => p.is_published).length}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Desktop Sidebar */}
        {sidebarOpen && !isMobile && (
          <div className={`bg-muted/30 border-r flex flex-col transition-all duration-200 ${isFullscreen ? 'w-0 overflow-hidden' : 'w-60 lg:w-80'}`}>
            <div className={`bg-muted/30 border-r flex flex-col transition-all duration-200 ${isFullscreen ? 'w-0 overflow-hidden' : 'w-80'}`}>
                      {/* Project Header */}
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/dashboard")}
                            className="p-0 h-auto"
                          >
                            <Home className="w-4 h-4" />
                          </Button>
                          <ChevronRight className="w-4 h-4" />
                          <span className="truncate">{project.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h1 className="font-semibold truncate">{project.title}</h1>
                          <Badge variant={project.is_public ? "default" : "secondary"}>
                            {project.is_public ? (
                              <><Globe className="w-3 h-3 mr-1" />Public</>
                            ) : (
                              <><Lock className="w-3 h-3 mr-1" />Private</>
                            )}
                          </Badge>
                        </div>
                      </div>
            
                      {/* Enhanced Navigation Tabs */}
                      <div className="p-4">
                        <div className="flex bg-muted rounded-lg p-1">
                          <Button
                            variant={activeTab === 'content' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('content')}
                            className="flex-1"
                          >
                            <FileText className="w-3 h-3" />
                            Content
                          </Button>
                          <Button
                            variant={activeTab === 'settings' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('settings')}
                            className="flex-1"
                          >
                            <Settings className="w-3 h-3" />
                            Settings
                          </Button>
                          <Button
                            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveTab('analytics')}
                            className="flex-1"
                          >
                            <Activity className="w-3 h-3" />
                            Stats
                          </Button>
                        </div>
                      </div>
            
                      {/* Content based on active tab */}
                      {activeTab === 'content' ? (
                        <div className="flex-1 overflow-hidden">
                          {/* Enhanced search and controls */}
                          <div className="p-4 space-y-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                              <Input
                                placeholder="Search pages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                              />
                            </div>
            
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">Pages ({filteredPages.length})</h3>
                              <div className="flex gap-1">
                                <Button size="sm" onClick={handleCreatePage} title="Add new page">
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" title="Filter pages">
                                  <Filter className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Pages List */}
                          <div className="flex-1 overflow-auto px-4 pb-4">
                            <div className="space-y-1">
                              {filteredPages.map((page) => (
                                <Card
                                  key={page.id}
                                  className={`cursor-pointer transition-all hover:shadow-sm ${
                                    selectedPage?.id === page.id ? 'border-primary bg-primary/5' : ''
                                  }`}
                                  onClick={() => {
                                    setSelectedPage(page);
                                    setPageContent({
                                      title: page.title,
                                      slug: page.slug,
                                      content: page.content || "",
                                      is_published: page.is_published
                                    });
                                  }}
                                >
                                  <CardHeader className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                        <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                                            <FileText className="w-4 h-4 flex-shrink-0" />
                                            {page.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <span>{page.content?.split(" ").length || 0} words</span>
                                            <span>•</span>
                                            <span>
                                            {Math.ceil((page.content?.split(" ").length || 0) / 200)} min read
                                            </span>
                                        </div>
                                        </div>
            
                                        <div className="flex items-center gap-1 ml-2">
                                        {page.is_published && (
                                            <div
                                            className="w-2 h-2 bg-green-500 rounded-full"
                                            title="Published"
                                            ></div>
                                        )}
            
                                         <Button variant="ghost" size="sm" className="p-0 w-6 h-6">
                                            {/* Icon here */}
                                            {/* <Settings className="w-4 h-4" /> */}
                                        </Button>
                                        </div>
                                    </div>
                                    </CardHeader>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : activeTab === 'settings' ? (
                        <div className="flex-1 p-4 space-y-6 overflow-auto">
                          {/* Project Settings */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Project Information</h3>
                            
                            <div>
                              <Label htmlFor="project-title">Project Title</Label>
                              <Input
                                id="project-title"
                                value={projectSettings.title}
                                onChange={(e) => setProjectSettings(prev => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="project-slug">Slug</Label>
                              <Input
                                id="project-slug"
                                value={projectSettings.slug}
                                onChange={(e) => setProjectSettings(prev => ({ ...prev, slug: e.target.value }))}
                              />
                            </div>
            
                            <div>
                              <Label htmlFor="project-description">Description</Label>
                              <Textarea
                                id="project-description"
                                value={projectSettings.description}
                                onChange={(e) => setProjectSettings(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                              />
                            </div>
                          </div>
            
                          <Separator />
            
                          {/* Visibility Settings */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Visibility & Access</h3>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Public Access</Label>
                                <p className="text-sm text-muted-foreground">
                                  Allow anyone to view this documentation
                                </p>
                              </div>
                              <Switch
                                checked={projectSettings.is_public}
                                onCheckedChange={(checked) => setProjectSettings(prev => ({ ...prev, is_public: checked }))}
                              />
                            </div>
            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Auto-save</Label>
                                <p className="text-sm text-muted-foreground">
                                  Automatically save changes every 10 seconds
                                </p>
                              </div>
                              <Switch
                                checked={autoSaveEnabled}
                                onCheckedChange={setAutoSaveEnabled}
                              />
                            </div>
                          </div>
            
                          <Separator />
            
                          {/* Export/Import */}
                          <div className="space-y-4">
                            <h3 className="font-medium">Export & Import</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                              <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Import
                              </Button>
                            </div>
                          </div>
            
                          <Button onClick={handleSaveProject} disabled={saving} className="w-full">
                            {saving ? "Saving..." : "Save Settings"}
                          </Button>
                        </div>
                      ) : (
                        // Analytics Tab
                        <div className="flex-1 p-4 space-y-6 overflow-auto">
                          <div className="space-y-4">
                            <h3 className="font-medium">Analytics Overview</h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                              <Card>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Total Pages</CardTitle>
                                  <CardDescription className="text-2xl font-bold text-primary">
                                    {pages.length}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                              
                              <Card>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Published</CardTitle>
                                  <CardDescription className="text-2xl font-bold text-green-600">
                                    {pages.filter(p => p.is_published).length}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                              
                              <Card>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Total Words</CardTitle>
                                  <CardDescription className="text-2xl font-bold text-primary">
                                    {pages.reduce((acc, p) => acc + (p.content?.split(' ').length || 0), 0).toLocaleString()}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                              
                              <Card>
                                <CardHeader className="p-3">
                                  <CardTitle className="text-sm">Last Updated</CardTitle>
                                  <CardDescription className="text-xs text-muted-foreground">
                                    {new Date(project.updated_at).toLocaleDateString()}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                            </div>
            
                            {pages.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Page Statistics</h4>
                                {pages.slice(0, 5).map((page, index) => (
                                  <div key={page.id} className="flex items-center justify-between p-2 rounded border">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-3 h-3 text-muted-foreground" />
                                      <span className="text-sm truncate">{page.title}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {page.content?.split(' ').length || 0} words
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header - Responsive */}
          <div className="p-2 md:p-4 border-b bg-background">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {!sidebarOpen && !isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                    className="p-1"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </Button>
                )}
                
                <div className="flex-1 min-w-0">
                  <Input
                    value={pageContent.title}
                    onChange={(e) => {
                      setPageContent(prev => ({ ...prev, title: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="font-semibold text-base md:text-lg border-none p-0 h-auto focus-visible:ring-0 truncate"
                    placeholder="Page title"
                  />
                  <Input
                    value={pageContent.slug}
                    onChange={(e) => {
                      setPageContent(prev => ({ ...prev, slug: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="text-xs md:text-sm text-muted-foreground border-none p-0 h-auto focus-visible:ring-0 mt-1 truncate"
                    placeholder="page-slug"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* Mobile actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSavePage}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPageContent(prev => ({ ...prev, is_published: !prev.is_published }))}>
                      {pageContent.is_published ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => project?.is_public && window.open(`/docs/${project.template_type}/${project.id}`, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={handleDeletePage}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Desktop buttons */}
                <div className="hidden md:flex items-center gap-2">
                  {!isApiDoc && (
                    <div className="flex bg-muted rounded-lg p-1">
                      {[
                        { mode: 'write', icon: Edit, label: 'Write' },
                        { mode: 'preview', icon: Eye, label: 'Preview' },
                        { mode: 'split', icon: Layers, label: 'Split' }
                      ].map(({ mode, icon: Icon, label }) => (
                        <Button
                          key={mode}
                          variant={editorMode === mode ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setEditorMode(mode as any)}
                          className="px-2"
                          title={label}
                        >
                          <Icon className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  )}

                  {isApiDoc && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addApiEndpoint}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden lg:inline">Add Endpoint</span>
                    </Button>
                  )}

                  <div className="flex items-center gap-1 text-sm">
                    <Switch
                      id="publish-toggle"
                      checked={pageContent.is_published}
                      onCheckedChange={(checked) => {
                        setPageContent(prev => ({ ...prev, is_published: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                    <Label htmlFor="publish-toggle" className="hidden lg:block">
                      Published
                    </Label>
                  </div>

                  <Button 
                    size="sm" 
                    onClick={handleSavePage} 
                    disabled={saving}
                    className="min-w-[80px]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Content - Responsive */}
          {isApiDoc ? (
            <div className="flex-1 overflow-hidden">
              {/* Responsive API docs editor */}
              {apiEndpoints.length > 0 ? (
                <div className="h-full flex flex-col lg:flex-row">
                  {/* Endpoint List - Stack on mobile */}
                  <div className="w-full lg:w-1/3 border-r bg-muted/20 overflow-auto">
                    <div className="w-1/3 border-r bg-muted/20 overflow-auto">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">API Endpoints</h3>
                            <Badge variant="outline">{apiEndpoints.length} endpoints</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            {apiEndpoints.map((endpoint, index) => (
                              <Card 
                                key={index}
                                className={`cursor-pointer transition-all hover:shadow-sm ${
                                  activeEndpointIndex === index ? 'border-primary bg-primary/5' : ''
                                }`}
                                onClick={() => setActiveEndpointIndex(index)}
                              >
                                <CardHeader className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Badge className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}>
                                      {endpoint.method}
                                    </Badge>
                                    <code className="text-sm font-mono truncate flex-1">
                                      {endpoint.endpoint}
                                    </code>
                                  </div>
                                  <CardTitle className="text-sm mt-2 truncate">
                                    {endpoint.title}
                                  </CardTitle>
                                  <CardDescription className="text-xs truncate">
                                    {endpoint.description}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                  </div>

                  {/* Endpoint Editor - Full width on mobile */}
                  <div className="flex-1 overflow-auto p-4">
                    <div className="flex-1 overflow-auto">
                        {activeEndpointIndex >= 0 && activeEndpointIndex < apiEndpoints.length && (
                          <div className="p-6">
                            <div className="max-w-4xl mx-auto space-y-6">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">Endpoint Details</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Configure your API endpoint documentation
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteApiEndpoint(activeEndpointIndex)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>

                              {/* Basic Info */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>HTTP Method</Label>
                                      <select
                                        value={apiEndpoints[activeEndpointIndex].method}
                                        onChange={(e) => updateApiEndpoint(activeEndpointIndex, 'method', e.target.value)}
                                        className="w-full p-2 border rounded bg-background"
                                      >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                        <option value="PATCH">PATCH</option>
                                      </select>
                                    </div>

                                    <div>
                                      <Label>Endpoint Path</Label>
                                      <Input
                                        value={apiEndpoints[activeEndpointIndex].endpoint}
                                        onChange={(e) => updateApiEndpoint(activeEndpointIndex, 'endpoint', e.target.value)}
                                        placeholder="/api/v1/endpoint"
                                        className="font-mono"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Title</Label>
                                    <Input
                                      value={apiEndpoints[activeEndpointIndex].title}
                                      onChange={(e) => updateApiEndpoint(activeEndpointIndex, 'title', e.target.value)}
                                      placeholder="Endpoint Title"
                                    />
                                  </div>

                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      value={apiEndpoints[activeEndpointIndex].description}
                                      onChange={(e) => updateApiEndpoint(activeEndpointIndex, 'description', e.target.value)}
                                      placeholder="Describe what this endpoint does"
                                      rows={3}
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Parameters */}
                              <Card>
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Parameters</CardTitle>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addParameterToEndpoint(activeEndpointIndex)}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Parameter
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {apiEndpoints[activeEndpointIndex].parameters?.map((param, paramIndex) => (
                                      <div key={paramIndex} className="flex gap-3 items-start p-3 border rounded">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                                          <Input
                                            value={param.name}
                                            onChange={(e) => updateParameter(activeEndpointIndex, paramIndex, 'name', e.target.value)}
                                            placeholder="param_name"
                                            className="font-mono"
                                          />
                                          <select
                                            value={param.type}
                                            onChange={(e) => updateParameter(activeEndpointIndex, paramIndex, 'type', e.target.value)}
                                            className="p-2 border rounded bg-background"
                                          >
                                            <option value="string">string</option>
                                            <option value="integer">integer</option>
                                            <option value="boolean">boolean</option>
                                            <option value="array">array</option>
                                            <option value="object">object</option>
                                          </select>
                                          <Input
                                            value={param.description}
                                            onChange={(e) => updateParameter(activeEndpointIndex, paramIndex, 'description', e.target.value)}
                                            placeholder="Parameter description"
                                            className="md:col-span-2"
                                          />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeParameter(activeEndpointIndex, paramIndex)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )) || []}
                                    
                                    {(!apiEndpoints[activeEndpointIndex].parameters || 
                                      apiEndpoints[activeEndpointIndex].parameters.length === 0) && (
                                      <div className="text-center py-4 text-muted-foreground">
                                        <p className="text-sm">No parameters defined</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Response Example */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Response Example</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <JsonEditor
                                    value={apiEndpoints[activeEndpointIndex].response}
                                    onChange={(newResponse) => updateApiEndpoint(activeEndpointIndex, 'response', newResponse)}
                                  />
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                      <div className="text-center max-w-md">
                        <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No API Endpoints</h3>
                        <p className="text-muted-foreground mb-6">
                          Start building your API documentation by adding your first endpoint. Define methods, parameters, and response examples.
                        </p>
                        <Button onClick={addApiEndpoint} size="lg">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Endpoint
                        </Button>
                      </div>
                    </div>
                </div>
              )}
            </div>
          ) : (
            // Regular content editor - responsive layout
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Markdown Editor - Full width on mobile, split on desktop */}
              {(editorMode === 'write' || editorMode === 'split') && (
                <div className={`${editorMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'} flex flex-col border-r`}>
                  <div className={`${editorMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-r`}>
                    {/* Formatting toolbar */}
                    <div className="border-b p-2 bg-muted/20">
                        <div className="flex items-center gap-1">
                        {[
                            { icon: Bold, action: () => {}, title: 'Bold' },
                            { icon: Italic, action: () => {}, title: 'Italic' },
                            { icon: Heading, action: () => {}, title: 'Heading' },
                            { icon: List, action: () => {}, title: 'List' },
                            { icon: Quote, action: () => {}, title: 'Quote' },
                            { icon: Link, action: () => {}, title: 'Link' },
                            { icon: ImageIcon, action: () => {}, title: 'Image' },
                        ].map(({ icon: Icon, action, title }) => (
                            <Button
                            key={title}
                            variant="ghost"
                            size="sm"
                            onClick={action}
                            title={title}
                            className="p-1 h-8 w-8"
                            >
                            <Icon className="w-4 h-4" />
                            </Button>
                        ))}
                        </div>
                    </div>

                    <Textarea
                        value={pageContent.content}
                        onChange={(e) => {
                        setPageContent(prev => ({ ...prev, content: e.target.value }));
                        setHasUnsavedChanges(true);
                        }}
                        className="flex-1 border-none font-mono resize-none focus-visible:ring-0"
                        placeholder="Start writing your documentation content here... You can use Markdown formatting.

                        # Heading 1
                        ## Heading 2

                        **Bold text** and *italic text*

                        - List item 1
                        - List item 2

                        ```javascript
                        // Code example
                        console.log('Hello World');
                        ```

                        > Blockquote example"
                    />
                    </div>
                </div>
              )}

              {/* Preview Pane - Full width on mobile, split on desktop */}
              {(editorMode === 'preview' || editorMode === 'split') && (
                <div className={`${editorMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'} bg-muted/10`}>
                  {(editorMode === 'preview' || editorMode === 'split') && (
                    <div className={`${editorMode === 'split' ? 'w-1/2' : 'w-full'} bg-muted/10`}>
                      <div className="p-6 overflow-auto h-full">
                        <div className="prose prose-sm max-w-none">
                          {/* Simple markdown-to-HTML conversion for demo */}
                          <div 
                            dangerouslySetInnerHTML={{
                              __html: pageContent.content
                                .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                                .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
                                .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
                                .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
                                .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
                                .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
                                .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')
                                .replace(/```([^`]+)```/gim, '<pre class="bg-blue-800 p-3 rounded font-mono text-sm overflow-x-auto"><code>$1</code></pre>')
                                .replace(/\n/gim, '<br>')
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor