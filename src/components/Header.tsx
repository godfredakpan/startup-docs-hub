import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  X, 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  Globe,
  ChevronDown,
  BookOpen,
  Clock,
  Code,
  Menu,
  Github,
  Twitter,
  Zap,
  Star,
  Download,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./theme-provider";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useState, useEffect, useCallback } from "react";

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user?: SupabaseUser | null;
  onSignOut?: () => void;
  notifications?: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
  }>;
  onNotificationRead?: (id: string) => void;
  version?: string;
  showVersionBadge?: boolean;
  brandName?: string;
  logoSrc?: string;
}

export const Header = ({ 
  activeSection, 
  onSectionChange, 
  user, 
  onSignOut,
  notifications = [],
  onNotificationRead,
  version = "v2.1.0",
  showVersionBadge = true,
  brandName = "Your Brand",
  logoSrc = "/logo.png"
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setNotificationCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen, badge: null },
    { id: 'docs', label: 'Docs', icon: BookOpen, badge: null },
    { id: 'changelog', label: 'Changelog', icon: Clock, badge: 'New' },
    { id: 'api', label: 'API', icon: Code, badge: null },
    { id: 'guides', label: 'Guides', icon: BookOpen, badge: null },
  ];

  const quickActions = [
    { label: 'Documentation', icon: BookOpen, action: () => onSectionChange('docs') },
    { label: 'API Reference', icon: Code, action: () => onSectionChange('api') },
    { label: 'Support', icon: HelpCircle, action: () => window.open('/support', '_blank') },
    { label: 'GitHub', icon: Github, action: () => window.open('https://github.com', '_blank') },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  const handleSearch = useCallback((query: string) => {
    // Implement search logic here
    console.log('Searching for:', query);
    setSearchOpen(false);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${isScrolled ? 'shadow-lg border-border/40' : ''}`}>
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile header */}
                    <div className="flex items-center justify-between p-4 border-b">
                      <div className="flex items-center gap-2">
                        <img 
                          onClick={() => window.location.href = "/"} 
                          src={logoSrc} 
                          alt="Logo" 
                          className="h-8 w-8 cursor-pointer rounded-md" 
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{brandName}</span>
                          {showVersionBadge && (
                            <Badge variant="secondary" className="text-xs">
                              {version}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                    
                    {/* Search in mobile */}
                    <div className="p-4 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search..." 
                          className="pl-9"
                          onClick={() => setSearchOpen(true)}
                        />
                      </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 flex flex-col gap-1 p-4">
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Navigation</p>
                        {navItems.map((item) => (
                          <Button
                            key={item.id}
                            variant={activeSection === item.id ? "secondary" : "ghost"}
                            className="justify-start gap-3 mb-1"
                            onClick={() => {
                              onSectionChange(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>

                      {/* Quick Actions */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</p>
                        {quickActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="justify-start gap-3 mb-1"
                            onClick={() => {
                              action.action();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <action.icon className="w-4 h-4" />
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </nav>

                    {/* Mobile user section */}
                    <div className="p-4 border-t bg-muted/30">
                      {user ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.user_metadata?.avatar_url} alt="" />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.user_metadata?.full_name || "User"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </Button>
                            <Button variant="outline" size="sm" onClick={onSignOut}>
                              <LogOut className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => window.location.href = "/auth"}
                        >
                          Sign In
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo and Brand */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
              <img 
                src={logoSrc} 
                alt="Logo" 
                className="h-8 w-8 rounded-md transition-transform hover:scale-105" 
              />
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-semibold text-lg">{brandName}</span>
                {showVersionBadge && (
                  <Badge variant="secondary" className="hidden md:flex text-xs">
                    {version}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className="gap-2 relative"
                  onClick={() => onSectionChange(item.id)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1 min-w-0 h-5">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search - Desktop */}
            <div className="hidden md:flex">
              <Button
                variant="outline"
                className="relative w-64 justify-start gap-2 bg-muted/50 hover:bg-muted"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1 text-left">
                  Search documentation...
                </span>
                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
            </div>

            {/* Search - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code}>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    <Button variant="ghost" size="sm">
                      Mark all read
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                          onClick={() => onNotificationRead?.(notification.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Support
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => window.open('/docs', '_blank')}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Documentation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('/support', '_blank')}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact Support
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('https://github.com', '_blank')}>
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost"
                  className="hidden sm:flex" 
                  onClick={() => window.location.href = "/auth"}
                >
                  Sign In
                </Button>
                <Button 
                  className="hidden sm:flex" 
                  onClick={() => window.location.href = "/auth"}
                >
                  Get Started
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Dialog for Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Search documentation, guides, API..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action, index) => (
              <CommandItem 
                key={index}
                onSelect={() => {
                  action.action();
                  setSearchOpen(false);
                }}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            {navItems.map((item) => (
              <CommandItem 
                key={item.id}
                onSelect={() => {
                  onSectionChange(item.id);
                  setSearchOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};