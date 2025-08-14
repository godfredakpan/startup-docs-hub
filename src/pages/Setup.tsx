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
import { useToast } from "@/hooks/use-toast";
import { Building, ArrowRight, Upload, Globe } from "lucide-react";

const Setup = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website_url: "",
    logo_url: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug when company name changes
      ...(field === 'name' && { slug: generateSlug(value) })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create company
      const { data: company, error: companyError } = await (supabase as any)
        .from('companies')
        .insert([{
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          website_url: formData.website_url,
          logo_url: formData.logo_url
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Update user profile with company_id
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .upsert(
            {
            user_id: user.id,     
            company_id: company.id,
            role: 'owner'
            },
            { onConflict: 'user_id' } 
        );

      if (profileError) throw profileError;

      toast({
        title: "Company created successfully!",
        description: "You can now start creating documentation projects.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error creating company",
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection="setup" 
        onSectionChange={() => {}} 
        user={user}
        onSignOut={handleSignOut}
      />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Set up your company</h1>
            <p className="text-muted-foreground">
              Tell us about your company to get started with documentation projects
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                This information will be used across your documentation projects and can be updated later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your company name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Company Slug */}
                <div>
                  <Label htmlFor="slug">Company Slug *</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                      docs.yourapp.com/
                    </span>
                    <Input
                      id="slug"
                      type="text"
                      placeholder="company-name"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="rounded-l-none"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be used in your documentation URLs
                  </p>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your company"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Website URL */}
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="website_url"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.website_url}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Logo URL */}
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Upload className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="logo_url"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={formData.logo_url}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Optional: Add a logo URL or upload one later
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={loading || !formData.name || !formData.slug}
                  >
                    {loading ? "Creating..." : "Create Company"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="mt-8 bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Need help getting started?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our getting started guide covers everything from company setup to publishing your first documentation.
              </p>
              <Button variant="outline" size="sm">
                View Getting Started Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Setup;