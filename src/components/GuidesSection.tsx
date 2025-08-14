import { useState, useEffect } from "react";
import { BookOpen, FileText, Code, HelpCircle, Menu, X, Search, Download, Share2, Copy, Upload, Star, Clock, Tag, Eye, ChevronRight, Filter, SortAsc, MoreVertical, ExternalLink, Bookmark, Home } from "lucide-react";
import { ThemeToggle } from "./theme-provider";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vscDarkMin, vscLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

interface DocPage {
  content: string;
  title: string;
  category?: string;
  lastModified?: string;
  readTime?: string;
  tags?: string[];
  featured?: boolean;
}

interface ProjectDetails {
  title: string;
  description?: string;
}

export const GuidesSection = ({ content, projectDetails }: { content: DocPage[], projectDetails: ProjectDetails }) => {
  const [activePage, setActivePage] = useState<DocPage | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title");
  const [viewMode, setViewMode] = useState<string>("list");
  const [bookmarkedPages, setBookmarkedPages] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState("light");

  // Set the first page as active by default
  useEffect(() => {
    if (content.length > 0 && !activePage) {
      setActivePage(content[0]);
    }
  }, [content, activePage]);

  // const categories = ["all", ...Array.from(new Set(content.map(page => page.category).filter(Boolean)))];

  // const getPageIcon = (page: DocPage) => {
  //   if (page.category === "API") return FileText;
  //   if (page.category === "Examples") return Code;
  //   if (page.category === "Support") return HelpCircle;
  //   if (page.featured) return Star;
  //   return BookOpen;
  // };

  const filteredAndSortedPages = content
    .filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           page.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           page.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        case "modified":
          return (b.lastModified || "").localeCompare(a.lastModified || "");
        default:
          return 0;
      }
    });

  const toggleBookmark = (pageTitle: string) => {
    const newBookmarks = new Set(bookmarkedPages);
    if (newBookmarks.has(pageTitle)) {
      newBookmarks.delete(pageTitle);
    } else {
      newBookmarks.add(pageTitle);
    }
    setBookmarkedPages(newBookmarks);
  };

  const copyPageLink = (page: DocPage) => {
    navigator.clipboard.writeText(`${window.location.origin}#${page.title.toLowerCase().replace(/\s+/g, '-')}`);
    // toast.success("Link copied to clipboard");
  };

 const renderMarkdown = (markdown: string) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
            {children}
          </blockquote>
        ),
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-blue-800 px-1 py-0.5 rounded" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};

  const getPageIcon = (title: string) => {
    if (title.includes("API") || title.includes("Reference")) return FileText;
    if (title.includes("Example")) return Code;
    if (title.includes("FAQ")) return HelpCircle;
    return BookOpen;
  };

  const filteredPages = content.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-all duration-300">
      {/* Enhanced Header */}
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {projectDetails?.title || "Documentation"}
                  </h1>
                  {projectDetails?.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{projectDetails.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search guides, tags, content..."
                className="pl-12 pr-4 py-2.5 w-[350px] bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <button 
                onClick={() => setImportExportOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all backdrop-blur-sm flex items-center gap-2 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-500/20">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar */}
        <aside className={`${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-80 bg-white/70 dark:bg-gray-800/70 
            backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-transform duration-300 ease-in-out flex flex-col`}>
          
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Documentation</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <SortAsc className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Mobile Search */}
            <div className="relative mb-4 md:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search guides..."
                className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            {/* <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div> */}
          </div>

          {/* Pages List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              {filteredAndSortedPages.map((page, index) => {
                const Icon = getPageIcon(page.title);
                const isBookmarked = bookmarkedPages.has(page.title);
                return (
                  <div
                    key={index}
                    className={`group relative rounded-xl transition-all duration-200 ${
                      activePage?.title === page.title
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 ring-1 ring-blue-500/20 shadow-sm'
                        : 'hover:bg-white/50 dark:hover:bg-gray-700/50 hover:shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActivePage(page);
                        setMobileSidebarOpen(false);
                      }}
                      className="flex items-start w-full p-4 text-left"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                        activePage?.title === page.title
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className={`text-sm font-medium mb-1 ${
                            activePage?.title === page.title
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {page.title}
                            {page.featured && <Star className="w-3 h-3 inline ml-1 text-amber-500" />}
                          </h3>
                        </div>
                        {page.category && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full mb-2">
                            <Tag className="w-3 h-3 mr-1" />
                            {page.category}
                          </span>
                        )}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-3">
                          {page.readTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {page.readTime}
                            </span>
                          )}
                          {page.lastModified && (
                            <span>{page.lastModified}</span>
                          )}
                        </div>
                        {page.tags && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {page.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                    
                    {/* Action Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(page.title);
                          }}
                          className={`p-1.5 rounded-md transition-colors ${
                            isBookmarked
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          <Bookmark className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyPageLink(page);
                          }}
                          className="p-1.5 rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {mobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Enhanced Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activePage ? (
            <div className="max-w-4xl mx-auto p-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <Home className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
                <span>{activePage.category || 'Documentation'}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">{activePage.title}</span>
              </div>

              {/* Page Header */}
              <div className="mb-8 pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {activePage.title}
                  </h1>
                  <button
                    onClick={() => toggleBookmark(activePage.title)}
                    className={`p-3 rounded-xl transition-all ${
                      bookmarkedPages.has(activePage.title)
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-white/50 dark:bg-gray-800/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
                    }`}
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {activePage.readTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{activePage.readTime}</span>
                    </div>
                  )}
                  {activePage.lastModified && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>Updated {activePage.lastModified}</span>
                    </div>
                  )}
                  {activePage.category && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                      {activePage.category}
                    </span>
                  )}
                </div>
                
                {activePage.tags && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {activePage.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              

              {/* Content */}
              
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-7 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
              {renderMarkdown(activePage.content || "")}
            </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Select a Guide</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose a guide from the sidebar to get started</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Enhanced Import/Export Modal */}
      {importExportOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Export Documentation</h3>
              <button 
                onClick={() => setImportExportOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(content, null, 2));
                  toast.success("Guides copied to clipboard");
                  setImportExportOpen(false);
                }}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 font-medium shadow-lg shadow-blue-500/20"
              >
                <Copy className="w-5 h-5" />
                Copy All Guides as JSON
              </button>
              
              <button className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-3 font-medium">
                <Download className="w-5 h-5" />
                Download as ZIP
              </button>
              
              <button className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-3 font-medium">
                <Upload className="w-5 h-5" />
                Import Guides
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}