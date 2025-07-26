import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Target, 
  Phone, 
  BarChart3, 
  Settings, 
  User,
  Search,
  Plus,
  ChevronDown,
  Home,
  Database,
  FileText,
  Mail,
  Calendar,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/',
    badge: null
  },
  {
    title: 'Leads',
    icon: Users,
    href: '/leads',
    badge: '23',
    subItems: [
      { title: 'All Leads', href: '/leads' },
      { title: 'New Leads', href: '/leads?status=new' },
      { title: 'Hot Leads', href: '/leads?hot=true' },
      { title: 'My Leads', href: '/leads?assigned=me' }
    ]
  },
  {
    title: 'Contacts',
    icon: User,
    href: '/contacts',
    badge: null
  },
  {
    title: 'Companies',
    icon: Building2,
    href: '/companies',
    badge: null
  },
  {
    title: 'Opportunities',
    icon: Target,
    href: '/opportunities',
    badge: '12',
    subItems: [
      { title: 'All Opportunities', href: '/opportunities' },
      { title: 'My Pipeline', href: '/opportunities?assigned=me' },
      { title: 'Closing Soon', href: '/opportunities?closing=soon' },
      { title: 'Won Deals', href: '/opportunities?stage=won' }
    ]
  },
  {
    title: 'Activities',
    icon: Calendar,
    href: '/activities',
    badge: '5',
    subItems: [
      { title: 'All Activities', href: '/activities' },
      { title: 'Calls', href: '/activities?type=call' },
      { title: 'Meetings', href: '/activities?type=meeting' },
      { title: 'Tasks', href: '/activities?type=task' }
    ]
  },
  {
    title: 'Communications',
    icon: Phone,
    href: '/communications',
    badge: null,
    subItems: [
      { title: 'Emails', href: '/communications/emails' },
      { title: 'SMS', href: '/communications/sms' },
      { title: 'Calls', href: '/communications/calls' }
    ]
  },
  {
    title: 'Reports',
    icon: BarChart3,
    href: '/reports',
    badge: null,
    subItems: [
      { title: 'Sales Pipeline', href: '/reports/pipeline' },
      { title: 'Team Performance', href: '/reports/team' },
      { title: 'Revenue', href: '/reports/revenue' },
      { title: 'Lead Sources', href: '/reports/sources' }
    ]
  },
  {
    title: 'Smart Views',
    icon: Database,
    href: '/smart-views',
    badge: null
  },
  {
    title: 'Templates',
    icon: FileText,
    href: '/templates',
    badge: null
  }
];

const bottomMenuItems = [
  {
    title: 'Notifications',
    icon: Bell,
    href: '/notifications',
    badge: '3'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    badge: null
  }
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Leads', 'Opportunities']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href));
  };

  const isSubItemActive = (href: string) => {
    const [pathname, search] = location.pathname.split('?');
    const [targetPath, targetSearch] = href.split('?');
    
    if (pathname !== targetPath) return false;
    if (!targetSearch) return true;
    
    const currentParams = new URLSearchParams(location.search);
    const targetParams = new URLSearchParams(targetSearch);
    
    for (const [key, value] of targetParams) {
      if (currentParams.get(key) !== value) return false;
    }
    
    return true;
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subItems?.some(subItem => 
      subItem.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className={cn("flex h-full w-64 flex-col bg-background border-r", className)}>
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Target className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">CRM Pro</span>
            <span className="text-xs text-muted-foreground">Sales Hub</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <Button 
          className="w-full justify-start" 
          size="sm"
          onClick={() => navigate('/leads/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.title);
          const itemIsActive = isActive(item.href);

          return (
            <div key={item.title}>
              {hasSubItems ? (
                <Collapsible 
                  open={isExpanded} 
                  onOpenChange={() => toggleExpanded(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between h-9 px-3",
                        itemIsActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1">
                    {item.subItems?.map((subItem) => (
                      <Button
                        key={subItem.href}
                        variant="ghost"
                        onClick={() => navigate(subItem.href)}
                        className={cn(
                          "w-full justify-start h-8 px-3 pl-10 text-sm",
                          isSubItemActive(subItem.href) && "bg-accent text-accent-foreground"
                        )}
                      >
                        {subItem.title}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full justify-start h-9 px-3",
                    itemIsActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  <span className="text-sm">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="border-t p-3 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.title}
              variant="ghost"
              onClick={() => navigate(item.href)}
              className={cn(
                "w-full justify-start h-9 px-3",
                isActive(item.href) && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="text-sm">{item.title}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}