import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Building, Users, Settings, ChevronRight, ArrowUpRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { TeamMembersSection } from "@/components/TeamMembersSection";

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
  template_type: string;
  description?: string;
  is_public: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  last_updated_by?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<DocumentationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

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
      setStatsLoading(true);
      
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

        // Fetch team members count
        const { count: membersCount, error: membersError } = await (supabase as any)
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', profileData.company_id);

        if (membersError) throw membersError;
        setTeamMembers(membersCount || 0);

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
      setStatsLoading(false);
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
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
            className="text-muted-foreground"
          >
            Preparing your dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  const hasCompany = profile?.company_id;

  // Calculate completion percentage for demo purposes
  const completionPercentage = projects.length > 0 
    ? Math.min(100, (projects.filter(p => p.is_public).length / projects.length) * 100)
    : 0;

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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.full_name || user?.email}!
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Here's what's happening with your documentation projects today.
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="hidden sm:flex items-center gap-1"
                      onClick={() => fetchUserData()}
                    >
                      <span>Refresh</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`${statsLoading ? 'animate-spin' : ''}`}
                      >
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh dashboard data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>

          {!hasCompany ? (
            /* No Company Setup */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="w-5 h-5 text-primary" />
                    Set up your company
                  </CardTitle>
                  <CardDescription>
                    Create your company profile to start building documentation projects and collaborate with your team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => navigate("/setup")}
                      className="group"
                    >
                      <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                      Create Company
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/join-company")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Join Existing Company
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Company Dashboard */
            <>
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid md:grid-cols-4 gap-6 mb-8"
              >
                {/* Projects */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Projects</CardTitle>
                        <FileText className="w-5 h-5 text-blue-900 dark:text-blue-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-16 mb-2" />
                      ) : (
                        <div className="text-3xl font-bold">{projects.length}</div>
                      )}
                      <p className="text-sm text-muted-foreground">Total projects</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Team */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Team</CardTitle>
                        <Users className="w-5 h-5 text-emerald-800 dark:text-emerald-200" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-16 mb-2" />
                      ) : (
                        <div className="text-3xl font-bold">{teamMembers}</div>
                      )}
                      <p className="text-sm text-muted-foreground">Active members</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Published */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Published</CardTitle>
                        <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-16 mb-2" />
                      ) : (
                        <div className="text-3xl font-bold">
                          {projects.filter((p) => p.is_public).length}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">Live documentation</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Completion */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Completion</CardTitle>
                        <Settings className="w-5 h-5 text-orange-600 dark:text-orange-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-16 mb-2" />
                      ) : (
                        <>
                          <div className="text-3xl font-bold">{Math.round(completionPercentage)}%</div>
                        <Progress
                          value={completionPercentage}
                          className={`h-2 mt-2 
                            ${completionPercentage < 50 
                              ? "bg-red-200 [&>div]:bg-red-500" 
                              : completionPercentage < 80 
                                ? "bg-yellow-200 [&>div]:bg-yellow-500" 
                                : "bg-green-200 [&>div]:bg-green-500"
                            }`}
                        />                        </>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">Published progress</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>


              {/* Recent Activity (Placeholder) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates across your projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.slice(0, 3).map((project) => (
                        <div key={`activity-${project.id}`} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <FileText className="w-4 h-4 text-blue-300 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{project.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(project.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {project.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          No recent activity yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Projects Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    Documentation Projects
                    <Badge variant="secondary" className="px-2 py-1 text-sm font-normal">
                      {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                    </Badge>
                  </h2>
                  <Button 
                    onClick={() => navigate("/create-project")}
                    className="group"
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                    New Project
                  </Button>
                </div>

                {projects.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                      <CardContent className="pt-6 pb-8">
                        <div className="text-center max-w-md mx-auto">
                          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                          <p className="text-muted-foreground mb-6">
                            Create your first documentation project to start sharing knowledge with your team and customers.
                          </p>
                          <Button 
                            onClick={() => navigate("/create-project")}
                            className="group"
                          >
                            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                            Create First Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div 
                    layout
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    <AnimatePresence>
                      {projects.map((project) => (
                        <motion.div
                          key={project.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ y: -5 }}
                        >
                          <Card 
                            className="h-full flex flex-col transition-all hover:shadow-md cursor-pointer"
                            onClick={() => navigate(`/project/${project.id}`)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                                <Badge
                                  variant={project.is_public ? "default" : "secondary"}
                                  className={`shrink-0 
                                    ${project.is_public 
                                      ? "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900" 
                                      : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700"
                                    }`}
                                >
                                  {project.is_public ? "Public" : "Private"}
                                </Badge>
                              </div>
                              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto pt-0">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                  Updated {new Date(project.updated_at).toLocaleDateString()}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-muted-foreground hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/project/${project.id}`);
                                  }}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>

              {/* Team Management Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-8"
              >
                <TeamMembersSection 
                  companyId={profile?.company_id || ""} 
                  currentUserRole={profile?.role}
                />
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;