import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Copy, Play, ChevronDown, ChevronRight, Folder, FolderOpen, 
  Settings, History, Save, Code, Server, Shield, Bookmark, 
  Search, Sun, Moon, Menu, X, Download, Upload, Share2, 
  HelpCircle, Bell, User, Plus, Terminal, GitBranch, 
  Zap, Eye, EyeOff, Clock, CheckCircle, XCircle, AlertCircle,
  Monitor, Smartphone, Tablet, Filter, SortAsc, Star,
  Box, Database, Key, Layers, RefreshCw, Maximize2,
  FileText, Globe, Activity, Cpu, MoreHorizontal
} from "lucide-react";
import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark, oneLight, vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { set } from "date-fns";


interface ApiEndpoint {
  method: string;
  endpoint: string;
  title: string;
  description: string;
  parameters: { name: string; type: string; description: string; required: boolean; example?: string }[];
  headers?: { name: string; value: string; description: string }[];
  response: any;
  examples?: { name: string; request: any; response: any }[];
}

interface ContentItem {
  content: string;
  title: string;
}

interface SidebarGroup {
  name: string;
  endpoints: ApiEndpoint[];
  open: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const getMethodColor = (method: string, isDark: boolean) => {
  const baseColors = {
    GET: { light: "bg-green-50 text-green-700 border-green-200", dark: "bg-green-900/30 text-green-300 border-green-700/50" },
    POST: { light: "bg-blue-50 text-blue-700 border-blue-200", dark: "bg-blue-900/30 text-blue-300 border-blue-700/50" },
    PUT: { light: "bg-orange-50 text-orange-700 border-orange-200", dark: "bg-orange-900/30 text-orange-300 border-orange-700/50" },
    DELETE: { light: "bg-red-50 text-red-700 border-red-200", dark: "bg-red-900/30 text-red-300 border-red-700/50" },
    default: { light: "bg-gray-50 text-gray-700 border-gray-200", dark: "bg-gray-900/30 text-gray-300 border-gray-700/50" }
  };
  
  const color = baseColors[method as keyof typeof baseColors] || baseColors.default;
  return isDark ? color.dark : color.light;
};


export const ApiDocSection = ({ content, projectDetails }: { content: ContentItem[]; projectDetails: any }) => {
  const [theme, setTheme] = useState('dark');
  const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpoint | null>(null);
  const [tryItResults, setTryItResults] = useState<{ [key: string]: any }>({});
  const [sidebarGroups, setSidebarGroups] = useState<SidebarGroup[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [requestHistory, setRequestHistory] = useState<any[]>([]);
  const [envVariables, setEnvVariables] = useState({
    baseUrl: "https://api.dochub.com",
    apiKey: "YOUR_API_KEY"
  });
  const [activeTab, setActiveTab] = useState("explorer");
  const [requestBody, setRequestBody] = useState("");
  const [responseTime, setResponseTime] = useState(0);
  const [responseStatus, setResponseStatus] = useState(0);
  const [savedEndpoints, setSavedEndpoints] = useState<ApiEndpoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("curl");
  const [showApiKey, setShowApiKey] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [openTabs, setOpenTabs] = useState<ApiEndpoint[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  
  // Initialize data
  useEffect(() => {
    if (!Array.isArray(content) || content.length === 0) {
      setSidebarGroups([]);
      setActiveEndpoint(null);
      setOpenTabs([]);
      setBreadcrumb([]);
      return;
    }

    const groups: SidebarGroup[] = content
      .map(item => {
        const endpoints = Array.isArray(parseEndpoints(item?.content)) 
          ? parseEndpoints(item?.content) 
          : [];

        return {
          name: item?.title || "Untitled",
          endpoints,
          open: true,
          icon: getGroupIcon(item?.title || "")
        };
      })
      .filter(group => group.endpoints.length > 0); // only keep groups with endpoints

    setSidebarGroups(groups);

    if (groups.length > 0) {
      const firstEndpoint = groups[0].endpoints[0];
      if (firstEndpoint) {
        setActiveEndpoint(firstEndpoint);
        setOpenTabs([firstEndpoint]);
        setBreadcrumb([groups[0].name, firstEndpoint.title]);
      }
    } else {
      setActiveEndpoint(null);
      setOpenTabs([]);
      setBreadcrumb([]);
    }
  }, [content]);


  const parseEndpoints = (content: string): ApiEndpoint[] => {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getGroupIcon = (title: string) => {
    if (title.toLowerCase().includes("auth")) return Shield;
    if (title.toLowerCase().includes("user")) return User;
    if (title.toLowerCase().includes("store") || title.toLowerCase().includes("shop")) return Server;
    if (title.toLowerCase().includes("data")) return Database;
    if (title.toLowerCase().includes("file")) return Box;
    return Folder;
  };

  const toggleGroup = (groupName: string) => {
    setSidebarGroups(prev => prev.map(g => g.name === groupName ? { ...g, open: !g.open } : g));
  };

  const openEndpointTab = (endpoint: ApiEndpoint, groupName: string) => {
    if (!openTabs.some(tab => tab.endpoint === endpoint.endpoint)) {
      setOpenTabs(prev => [...prev, endpoint]);
    }
    const tabIndex = openTabs.findIndex(tab => tab.endpoint === endpoint.endpoint);
    setActiveTabIndex(tabIndex >= 0 ? tabIndex : openTabs.length);
    setActiveEndpoint(endpoint);
    setBreadcrumb([groupName, endpoint.title]);
    setMobileSidebarOpen(false);
  };

  const closeTab = (index: number) => {
    const newTabs = openTabs.filter((_, i) => i !== index);
    setOpenTabs(newTabs);
    
    if (activeTabIndex >= newTabs.length) {
      setActiveTabIndex(Math.max(0, newTabs.length - 1));
    }
    
    if (newTabs.length > 0) {
      setActiveEndpoint(newTabs[activeTabIndex] || newTabs[0]);
    } else {
      setActiveEndpoint(null);
    }
  };

  const tryIt = async (endpoint: ApiEndpoint) => {
    setIsSending(true);
    const startTime = Date.now();
    
    try {
      let url = `${envVariables.baseUrl}${endpoint.endpoint}`;
      let options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Authorization": `Bearer ${envVariables.apiKey}`,
          "Content-Type": "application/json",
          ...(endpoint.headers?.reduce((acc, h) => ({ ...acc, [h.name]: h.value }), {}))
        },
      };

      if (endpoint.method !== "GET" && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = Date.now();
      
      setResponseTime(endTime - startTime);
      setResponseStatus(res.status);
      setTryItResults(prev => ({ ...prev, [endpoint.endpoint]: data }));
      
      setRequestHistory(prev => [{
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        timestamp: new Date().toISOString(),
        status: res.status,
        time: endTime - startTime
      }, ...prev.slice(0, 9)]);
    } catch (error: any) {
      setTryItResults(prev => ({ ...prev, [endpoint.endpoint]: { error: error.message } }));
    } finally {
      setIsSending(false);
    }
  };

  const filteredGroups = sidebarGroups.map(group => ({
    ...group,
    endpoints: group.endpoints.filter(endpoint => {
      const matchesSearch = endpoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === "all" || 
        (filterBy === "favorites" && savedEndpoints.some(e => e.endpoint === endpoint.endpoint)) ||
        endpoint.method.toLowerCase() === filterBy.toLowerCase();
      
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      if (sortBy === "method") return a.method.localeCompare(b.method);
      return a.title.localeCompare(b.title);
    })
  })).filter(group => group.endpoints.length > 0);

  const generateCodeExamples = (endpoint: ApiEndpoint) => {
    const params = endpoint.parameters?.reduce((acc, p) => ({ ...acc, [p.name]: p.example || `sample_${p.name}` }), {});
    const hasParams = params && Object.keys(params).length > 0;

    return {
      curl: `curl -X ${endpoint.method} \\
  -H 'Authorization: Bearer ${envVariables.apiKey}' \\
  -H 'Content-Type: application/json' \\
  ${endpoint.method !== 'GET' && hasParams ? `-d '${JSON.stringify(params, null, 2)}' \\\n  ` : ''}${envVariables.baseUrl}${endpoint.endpoint}`,

      javascript: `const response = await fetch('${envVariables.baseUrl}${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer ${envVariables.apiKey}',
    'Content-Type': 'application/json'
  }${endpoint.method !== 'GET' && hasParams ? `,
  body: JSON.stringify(${JSON.stringify(params, null, 2)})` : ''}
});
const data = await response.json();`,

      python: `import requests

headers = {
    'Authorization': 'Bearer ${envVariables.apiKey}',
    'Content-Type': 'application/json'
}

${endpoint.method !== 'GET' && hasParams ? `payload = ${JSON.stringify(params, null, 2)}` : ''}

response = requests.${endpoint.method.toLowerCase()}(
    '${envVariables.baseUrl}${endpoint.endpoint}',
    headers=headers${endpoint.method !== 'GET' && hasParams ? `,
    json=payload` : ''}
)

print(response.json())`,

      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${envVariables.baseUrl}${endpoint.endpoint}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => '${endpoint.method}',
  CURLOPT_POSTFIELDS => ${JSON.stringify(params, null, 2)},
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer ${envVariables.apiKey}',
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;`,

      ruby: `require 'net/http'

uri = URI('${envVariables.baseUrl}${endpoint.endpoint}')
uri.query = URI.encode_www_form(${JSON.stringify(params, null, 2)})

http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri.request_uri)
request['Authorization'] = 'Bearer ${envVariables.apiKey}'
request['Content-Type'] = 'application/json'

response = http.request(request)
puts response.body`,

      go: `package main

import (
  "bytes"
  "encoding/json"
  "fmt"
  "net/http"
)

func main() {
  client := &http.Client{}
  
  ${endpoint.method !== 'GET' && hasParams ? `payload := ${JSON.stringify(params, null, 2)}
  jsonPayload, _ := json.Marshal(payload)\n\n  ` : ''}req, _ := http.NewRequest("${endpoint.method}", 
    "${envVariables.baseUrl}${endpoint.endpoint}", 
    ${endpoint.method !== 'GET' && hasParams ? `bytes.NewBuffer(jsonPayload)` : `nil`})
  
  req.Header.Set("Authorization", "Bearer ${envVariables.apiKey}")
  req.Header.Set("Content-Type", "application/json")
  
  resp, _ := client.Do(req)
  defer resp.Body.Close()
  
  var result map[string]interface{}
  json.NewDecoder(resp.Body).Decode(&result)
  fmt.Println(result)
}`
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard!");
  };

  const handleClose = () => {
    // Navigate to home page (you can customize this URL)
    window.location.href = '/';
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    if (openTabs.length > 0) {
      setOpenTabs([]);
      toast("All tabs minimized!");
    }

  };

  const handleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };


  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!projectDetails || !projectDetails?.is_public) {
    return (
      <div className={`${theme} min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900`}>
        <div className="text-center p-8 bg-white dark:bg-blue-800 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 dark:text-gray-300">Project not public.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={theme}>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* VSCode-style Title Bar */}
        <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
          <div className="flex space-x-2">
            <div onClick={() => setShowCloseConfirm(true)} className="w-3 h-3 cursor-pointer rounded-full bg-red-500"></div>
            <div onClick={handleMinimize} className="w-3 h-3 rounded-full cursor-pointer bg-yellow-500"></div>
            <div onClick={handleFullscreen} className="w-3 h-3 rounded-full cursor-pointer bg-green-500"></div>
          </div>
          <div className="flex-1 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
            {projectDetails.title} - API Documentation
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-6 w-6 p-0"
            >
              {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Menu Bar */}
        {/* <div className="h-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2 text-xs">
          <div className="flex space-x-4">
            <span className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer">File</span>
            <span className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer">Edit</span>
            <span className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer">View</span>
            <span className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer">Terminal</span>
            <span className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer">Help</span>
          </div>
          <div className="flex-1"></div>
          <div className="text-gray-500 dark:text-gray-400">
            {breadcrumb.join(' › ')}
          </div>
        </div> */}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Activity Bar */}
          <div className="w-12 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              className={`h-12 w-12 rounded-none ${activeTab === 'explorer' ? 'bg-gray-200 dark:bg-gray-700 border-l-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('explorer')}
            >
              <Folder className="w-5 h-5" />
            </Button>
            {/* <Button
              variant="ghost"
              size="sm"
              className={`h-12 w-12 rounded-none ${activeTab === 'search' ? 'bg-gray-200 dark:bg-gray-700 border-l-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <Search className="w-5 h-5" />
            </Button> */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-12 w-12 rounded-none ${activeTab === 'history' ? 'bg-gray-200 dark:bg-gray-700 border-l-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-12 w-12 rounded-none ${activeTab === 'settings' ? 'bg-gray-200 dark:bg-gray-700 border-l-2 border-blue-500' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <div className="flex-1"></div>
            
            <Button variant="ghost" size="sm" className="h-12 w-12 rounded-none">
              <User className="w-5 h-5" />
            </Button>
          </div>

          {/* Sidebar */}
          <div className={`w-80 bg-gray-900 dark:bg-gray-450 border-r border-gray-200 dark:border-gray-700 flex flex-col ${mobileSidebarOpen ? 'block' : 'hidden md:flex'}`}>
            {/* Sidebar Header */}
            <div className="h-8 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {activeTab === 'explorer' && 'Explorer'}
                {activeTab === 'search' && 'Search'}
                {activeTab === 'history' && 'History'}
                {activeTab === 'settings' && 'Settings'}
              </span>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'explorer' && (
                <div className="h-full flex flex-col">
                  {/* Search Bar */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <Input
                        placeholder="Search endpoints..."
                        className="pl-7 h-6 text-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex gap-2">
                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="h-6 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="get">GET</SelectItem>
                        <SelectItem value="post">POST</SelectItem>
                        <SelectItem value="put">PUT</SelectItem>
                        <SelectItem value="delete">DELETE</SelectItem>
                        <SelectItem value="favorites">Favorites</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-6 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">By Name</SelectItem>
                        <SelectItem value="method">By Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Endpoints Tree */}
                  <div className="flex-1 bg-dark-2 overflow-y-auto">
                    {filteredGroups?.map((group) => {
                      const Icon = group.icon || Folder;
                      return (
                        <div key={group.name}>
                          <button
                            onClick={() => toggleGroup(group.name)}
                            className="flex items-center w-full px-2 py-1 text-left text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            {group.open ? (
                              <ChevronDown className="w-3 h-3 mr-1 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 mr-1 text-gray-400" />
                            )}
                            {group.open ? (
                              <FolderOpen className="w-3 h-3 mr-2 text-blue-500" />
                            ) : (
                              <Icon className="w-3 h-3 mr-2 text-gray-500" />
                            )}
                            <span className="font-medium">{group.name}</span>
                            <Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0">
                              {group.endpoints.length}
                            </Badge>
                          </button>
                          
                          {group.open && (
                            <div className="ml-4 border-l border-gray-300 dark:border-gray-600">
                              {group.endpoints.map((endpoint, idx) => (
                                <button
                                  key={`${group.name}-${idx}`}
                                  onClick={() => openEndpointTab(endpoint, group.name)}
                                  className={`flex items-center w-full px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-l-2 ${
                                    activeEndpoint?.endpoint === endpoint.endpoint 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-transparent'
                                  }`}
                                >
                                  <FileText className="w-3 h-3 mr-2 text-gray-400" />
                                  <Badge 
                                    className={`${getMethodColor(endpoint.method, theme === 'dark')} text-[9px] mr-2 px-1 py-0 font-mono`}
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="truncate font-medium">{endpoint.title}</div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-mono">
                                      {endpoint.endpoint}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'search' && (
                <div className="p-3">
                  <div className="space-y-2">
                    <Input placeholder="Search in files..." className="text-xs h-6" />
                    <Input placeholder="Files to include..." className="text-xs h-6" />
                    <Input placeholder="Files to exclude..." className="text-xs h-6" />
                    <Button size="sm" className="w-full h-6 text-xs">
                      <Search className="w-3 h-3 mr-1" />
                      Search
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Request History</span>
                    {requestHistory.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setRequestHistory([])} className="h-5 text-[10px]">
                        Clear
                      </Button>
                    )}
                  </div>
                  {requestHistory.length > 0 ? (
                    <div className="space-y-1">
                      {requestHistory.slice(0, 10).map((req, idx) => (
                        <div key={idx} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge className={getMethodColor(req.method, theme === 'dark')} variant="outline">
                              {req.method}
                            </Badge>
                            <Badge 
                              variant={req.status >= 400 ? "destructive" : "default"}
                              className="text-[9px]"
                            >
                              {req.status}
                            </Badge>
                            <span className="text-gray-500 dark:text-gray-400 text-[10px] ml-auto">
                              {req.time}ms
                            </span>
                          </div>
                          <div className="font-mono text-[10px] truncate text-gray-600 dark:text-gray-400">
                            {req.endpoint}
                          </div>
                          <div className="text-[9px] text-gray-500 dark:text-gray-500">
                            {new Date(req.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No requests yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-3 space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Base URL</Label>
                    <Input
                      value={envVariables.baseUrl}
                      onChange={(e) => setEnvVariables({...envVariables, baseUrl: e.target.value})}
                      className="mt-1 h-6 text-xs"
                      placeholder="https://api.example.com"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">API Key</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={envVariables.apiKey}
                        onChange={(e) => setEnvVariables({...envVariables, apiKey: e.target.value})}
                        className="h-6 text-xs pr-8"
                        placeholder="Your API key"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-2 h-2" /> : <Eye className="w-2 h-2" />}
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-xs">
                      <span>Theme</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="h-6"
                      >
                        {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Bar */}
            {openTabs.length > 0 && (
              <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex overflow-x-auto">
                {openTabs.map((tab, index) => (
                  <div
                    key={tab.endpoint}
                    className={`flex items-center px-3 border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-0 ${
                      index === activeTabIndex 
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setActiveTabIndex(index);
                      setActiveEndpoint(tab);
                    }}
                  >
                    <Badge className={`${getMethodColor(tab.method, theme === 'dark')} text-[8px] mr-2 px-1 py-0`}>
                      {tab.method}
                    </Badge>
                    <span className="text-xs truncate max-w-32">{tab.title}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(index);
                      }}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Main Editor Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Documentation Panel */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                {activeEndpoint ? (
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {activeEndpoint.title}
                          </h1>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {activeEndpoint.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {/* <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const updated = [...savedEndpoints];
                              if (!updated.some(e => e.endpoint === activeEndpoint.endpoint)) {
                                updated.push(activeEndpoint);
                                setSavedEndpoints(updated);
                              }
                            }}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Save
                          </Button> */}
                          <Button 
                            size="sm"
                            onClick={() => tryIt(activeEndpoint)}
                            disabled={isSending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isSending ? (
                              <>
                                <RefreshCw className="animate-spin w-3 h-3 mr-1" />
                                Testing...
                              </>
                            ) : (
                              <>
                                Run  <Play className="w-3 h-3" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Endpoint URL */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Badge className={`${getMethodColor(activeEndpoint.method, theme === 'dark')} font-mono text-xs px-2 py-1`}>
                          {activeEndpoint.method}
                        </Badge>
                        <code className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded flex-1 text-gray-900 dark:text-gray-100">
                          <span className="text-gray-500 dark:text-gray-400">{envVariables.baseUrl}</span>
                          <span>{activeEndpoint.endpoint}</span>
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`${envVariables.baseUrl}${activeEndpoint.endpoint}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Parameters */}
                      {activeEndpoint.parameters?.length > 0 && (
                        <section>
                          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Key className="w-4 h-4 text-blue-500" />
                            Parameters
                          </h2>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Type</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Required</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {activeEndpoint.parameters.map((param, idx) => (
                                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                      <td className="py-3 px-4">
                                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono text-gray-900 dark:text-gray-100">
                                          {param.name}
                                        </code>
                                      </td>
                                      <td className="py-3 px-4">
                                        <Badge variant="outline" className="text-xs font-mono">
                                          {param.type || "string"}
                                        </Badge>
                                      </td>
                                      <td className="py-3 px-4">
                                        {param.required ? (
                                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">
                                            Required
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-xs">
                                            Optional
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                        {param.description}
                                        {param.example && (
                                          <div className="mt-1">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Example: </span>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded font-mono">
                                              {param.example}
                                            </code>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </section>
                      )}

                      {/* Headers */}
                      {activeEndpoint.headers?.length > 0 && (
                        <section>
                          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Database className="w-4 h-4 text-green-500" />
                            Headers
                          </h2>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Value</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {activeEndpoint.headers.map((header, idx) => (
                                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                      <td className="py-3 px-4">
                                        <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                                          {header.name}
                                        </code>
                                      </td>
                                      <td className="py-3 px-4">
                                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                                          {header.value}
                                        </code>
                                      </td>
                                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                                        {header.description}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </section>
                      )}

                      {/* Examples */}
                      {activeEndpoint.examples?.length > 0 && (
                        <section>
                          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Code className="w-4 h-4 text-purple-500" />
                            Examples
                          </h2>
                          <Tabs defaultValue="0" className="space-y-4">
                            <TabsList className="bg-gray-100 dark:bg-gray-800">
                              {activeEndpoint.examples.map((example, idx) => (
                                <TabsTrigger key={idx} value={idx.toString()} className="text-sm">
                                  {example.name}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            {activeEndpoint.examples.map((example, idx) => (
                              <TabsContent key={idx} value={idx.toString()} className="space-y-4">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Request</h4>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => copyToClipboard(JSON.stringify(example.request, null, 2))}
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                  <SyntaxHighlighter  style={vscDarkPlus} language="json">
                                    {JSON.stringify(example.request, null, 2)}
                                  </SyntaxHighlighter>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Response</h4>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => copyToClipboard(JSON.stringify(example.response, null, 2))}
                                    >
                                      <Copy className="w-3 h-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                  <SyntaxHighlighter  style={vscDarkPlus} language="json">
                                    {JSON.stringify(example.response, null, 2)}
                                  </SyntaxHighlighter>
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                        </section>
                      )}

                      {/* Try It Out Section */}
                      <section>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Terminal className="w-4 h-4 text-orange-500" />
                          Try It Out
                        </h2>
                        
                        {/* Request Configuration */}
                        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          {/* Parameters Input */}
                          {activeEndpoint.parameters?.length > 0 && (
                            <div>
                              <h3 className="font-medium mb-3">Parameters</h3>
                              <div className="space-y-2">
                                {activeEndpoint.parameters.map((param, idx) => (
                                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                                    <div>
                                      <Label className="font-medium">
                                        {param.name}
                                        {param.required && <span className="text-red-500 ml-1">*</span>}
                                      </Label>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {param.type || "string"}
                                      </p>
                                    </div>
                                    <Input
                                      placeholder={param.example || `Enter ${param.name}`}
                                      defaultValue={param.example || ""}
                                      className="bg-white dark:bg-gray-900"
                                    />
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                      {param.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Request Body */}
                          {activeEndpoint.method !== "GET" && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium">Request Body</h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const params = activeEndpoint.parameters?.reduce((acc, p) => ({ ...acc, [p.name]: p.example || `sample_${p.name}` }), {});
                                    setRequestBody(JSON.stringify(params, null, 2));
                                  }}
                                >
                                  Generate Sample
                                </Button>
                              </div>
                              <textarea
                                value={requestBody}
                                onChange={(e) => setRequestBody(e.target.value)}
                                className="w-full h-32 p-3 bg-gray-900 text-gray-100 font-mono text-sm rounded border border-gray-700 resize-none"
                                placeholder="{\n  // Enter request body here\n}"
                              />
                            </div>
                          )}

                          {/* Response */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">Response</h3>
                              {responseStatus > 0 && (
                                <div className="flex items-center gap-4">
                                  <Badge 
                                    variant={responseStatus >= 400 ? "destructive" : responseStatus >= 200 && responseStatus < 300 ? "default" : "secondary"}
                                    className="flex items-center gap-1"
                                  >
                                    {responseStatus >= 400 ? <XCircle className="w-3 h-3" /> : responseStatus >= 200 && responseStatus < 300 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {responseStatus}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {responseTime}ms
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 z-10"
                                onClick={() => copyToClipboard(JSON.stringify(tryItResults[activeEndpoint.endpoint] || activeEndpoint.response, null, 2))}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <SyntaxHighlighter  style={vscDarkPlus} className="w-full h-40 p-3 bg-gray-900 text-gray-100 font-mono text-sm rounded border border-gray-700" language="json">
                                {JSON.stringify(tryItResults[activeEndpoint.endpoint] || activeEndpoint.response, null, 2)}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No endpoint selected</p>
                      <p className="text-sm">Choose an endpoint from the explorer to view its documentation</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Examples Panel */}
              {activeEndpoint && (
                <div className="w-96 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="h-8 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Code Examples
                    </span>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-24 h-5 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curl">cURL</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="ruby">Ruby</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Tabs value={selectedLanguage} className="w-full text-xs">
                    {Object.entries(generateCodeExamples(activeEndpoint)).map(([language, code]) => (
                      <TabsContent key={language} value={language} className="mt-3">
                        <div className="relative rounded overflow-hidden border">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-1 right-1"
                            onClick={() => copyToClipboard(code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <SyntaxHighlighter 
                            language={language === 'curl' ? 'bash' : language}
                            style={vscDarkPlus}
                            customStyle={{ 
                              margin: 0,
                              padding: '0.75rem',
                              fontSize: '0.7rem',
                              lineHeight: '1.2',
                              overflow: 'scroll',
                            }}
                            showLineNumbers
                          >
                            {code}
                          </SyntaxHighlighter>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        

        {/* Status Bar */}
        <div className="h-6 bg-blue-800 dark:bg-blue-900 text-white flex items-center justify-between px-3 text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Connected
            </span>
            <span>{filteredGroups.reduce((acc, g) => acc + g.endpoints.length, 0)} endpoints</span>
            <span>{requestHistory.length} requests</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Ready
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>
        </div>

        {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200/50 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Close Documentation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to close?</p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You'll be redirected to the home page. Any unsaved progress will be lost.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100  dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};