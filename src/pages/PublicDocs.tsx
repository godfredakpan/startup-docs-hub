import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DocsSection } from "@/components/DocsSection";
import { ChangelogSection } from "@/components/ChangelogSection";
import { ApiDocSection } from "@/components/ApiDocSection";
import { GuidesSection } from "@/components/GuidesSection";
import { HeroSection } from "@/components/HeroSection";

const PublicDocsPage = () => {
  const { projectId, templateType } = useParams();
  const [pageContent, setPageContent] = useState<any>(null); 
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // console.log("pageContent:", pageContent);
  // Decide which section to render
  const renderSection = () => {
    switch (templateType) {
      case "docs":
        return <DocsSection content={pageContent} />;
      case "changelog":
        return <ChangelogSection content={pageContent} />;
      case "api-docs":
        return <ApiDocSection content={pageContent} projectDetails={projectDetails} />;
      case "user-guide":
        return <GuidesSection content={pageContent} projectDetails={projectDetails} />;
      default:
        return <HeroSection />;
    }
  };

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);

        // Step 1: Find the project by slug
        const { data: project, error: projectError } = await (supabase as any)
          .from("documentation_projects")
          .select("id, title, slug, description, is_public, cover_image_url")
          .eq("id", projectId)
          .eq("is_public", true) // only public projects
          .maybeSingle();

        // If project not found or error
        if (projectError || !project) {
          setPageContent("# Not Found\nThis project does not exist or is private.");
          setProjectDetails(null);
          return;
        }

        // Step 2: Get published pages for the project
        const { data: pages, error: pageError } = await (supabase as any)
          .from("documentation_pages")
          .select("content, title")
          .eq("project_id", project.id)
          .eq("is_published", true)
          .order("order_index", { ascending: true });

        if (pageError) {
          throw pageError;
        }

        if (!pages || pages.length === 0) {
          setPageContent(
            templateType === "api-docs"
              ? { error: "No API documentation found" }
              : "Content not available"
          );
          setProjectDetails(project);
          return;
        }

        setProjectDetails(project);
        setPageContent(pages);

      } catch (err) {
        console.error("Error fetching docs page:", err);
        setPageContent("# Not Found\nThis page does not exist.");
        setProjectDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [projectId]);


  if (loading) {
    return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <svg
            className="w-6 h-6 text-blue-600 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading
          </p>
        </div>
      </div>

    );
  }

  if (!pageContent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Content not available
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {renderSection()}
    </div>
  );
};

export default PublicDocsPage;
