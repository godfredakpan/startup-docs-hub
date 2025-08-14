import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { FileText, ArrowRight, Globe, Lock, BookOpen, Code, Zap } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  company_id?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

const CreateProject = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    is_public: false,
    cover_image_url: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const templates = [
    {
      id: "blank",
      name: "Blank Project",
      description: "Start from scratch with a clean slate",
      icon: FileText,
      color: "bg-gray-100 text-gray-600"
    },
    {
      id: "api-docs",
      name: "API Documentation",
      description: "Perfect for REST APIs, GraphQL, and technical references",
      icon: Code,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "user-guide",
      name: "User Guide",
      description: "Step-by-step guides and tutorials for end users",
      icon: BookOpen,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "getting-started",
      name: "Getting Started",
      description: "Onboarding and quick start documentation",
      icon: Zap,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  useEffect(() => {
    // Check authentication and fetch profile
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch user profile
      const { data: profileData, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setProfile(profileData);

      // Check if user has a company
      if (!profileData?.company_id) {
        navigate("/setup");
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug when title changes
      ...(field === 'title' && typeof value === 'string' && { slug: generateSlug(value) })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.company_id) return;

    setLoading(true);

    try {
      // Create documentation project
      const { data: project, error: projectError } = await (supabase as any)
        .from('documentation_projects')
        .insert([{
          company_id: profile.company_id,
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          is_public: formData.is_public,
          cover_image_url: formData.cover_image_url,
          template_type: selectedTemplate
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      toast({
        title: "Project created successfully!",
        description: "You can now start adding content to your documentation.",
      });

      navigate(`/project/${project.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection="projects" 
        onSectionChange={() => {}} 
        user={user}
        onSignOut={handleSignOut}
      />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="p-0 h-auto"
              >
                Dashboard
              </Button>
              <span>/</span>
              <span>Create Project</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Create new project</h1>
            <p className="text-muted-foreground">
              Start building your documentation with a project template or from scratch
            </p>
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Choose a template</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.color}`}>
                        <template.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Project Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Configure your documentation project settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Title */}
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., API Documentation, User Guide"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                {/* Project Slug */}
                <div>
                  <Label htmlFor="slug">Project Slug *</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                      /docs/
                    </span>
                    <Input
                      id="slug"
                      type="text"
                      placeholder="project-name"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be used in your documentation URL
                  </p>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this documentation covers"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <Label htmlFor="cover_image_url">Cover Image URL</Label>
                  <Input
                    id="cover_image_url"
                    type="url"
                    placeholder="https://example.com/cover-image.jpg"
                    value={formData.cover_image_url}
                    onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional: Add a cover image for your documentation
                  </p>
                </div>

                {/* Visibility */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.is_public 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {formData.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {formData.is_public ? 'Public' : 'Private'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formData.is_public 
                          ? 'Anyone with the link can view this documentation'
                          : 'Only team members can access this documentation'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_public}
                    onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={loading || !formData.title || !formData.slug || !selectedTemplate}
                  >
                    {loading ? "Creating..." : "Create Project"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;