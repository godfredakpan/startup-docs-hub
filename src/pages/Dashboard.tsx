import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Building, Users, Settings } from "lucide-react";

// Temporary interfaces until types are generated
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

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentationProject {
  id: string;
  company_id: string;
  title: string;
  slug: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<DocumentationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile  
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      setProfile(profileData);

      // Fetch companies if user has a company
      if (profileData && profileData.company_id) {
        const { data: companyData, error: companyError } = await (supabase as any)
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id);

        if (companyError) throw companyError;
        setCompanies(companyData || []);

        // Fetch documentation projects
        const { data: projectsData, error: projectsError } = await (supabase as any)
          .from('documentation_projects')
          .select('*')
          .eq('company_id', profileData.company_id)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const hasCompany = profile?.company_id;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection="dashboard" 
        onSectionChange={() => {}} 
        user={user}
        onSignOut={handleSignOut}
      />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name || user?.email}!
            </h1>
            <p className="text-muted-foreground">
              Manage your documentation projects and team collaboration.
            </p>
          </div>

          {!hasCompany ? (
            /* No Company Setup */
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Set up your company
                </CardTitle>
                <CardDescription>
                  Create your company profile to start building documentation projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/setup")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Company
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Company Dashboard */
            <>
              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Documentation Projects</CardTitle>
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{projects.length}</div>
                    <p className="text-sm text-muted-foreground">Active projects</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Team Members</CardTitle>
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">1</div>
                    <p className="text-sm text-muted-foreground">Active members</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Published Docs</CardTitle>
                      <Settings className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {projects.filter(p => p.is_public).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Live documentation</p>
                  </CardContent>
                </Card>
              </div>

              {/* Projects Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Documentation Projects</h2>
                  <Button onClick={() => navigate("/create-project")}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </div>

                {projects.length === 0 ? (
                  <Card className="border-dashed border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first documentation project to get started.
                        </p>
                        <Button onClick={() => navigate("/create-project")}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card key={project.id} className="hover:shadow-soft transition-all duration-300 cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <Badge variant={project.is_public ? "default" : "secondary"}>
                              {project.is_public ? "Public" : "Private"}
                            </Badge>
                          </div>
                          <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/project/${project.id}`)}
                            >
                              Edit
                            </Button>
                            {project.is_public && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(`/docs/${project.slug}`, '_blank')}
                              >
                                View Live
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;