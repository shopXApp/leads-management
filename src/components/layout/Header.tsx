import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Plus,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  Building,
  Users,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { AddLeadDialog } from '@/components/forms/AddLeadDialog';
import { AddContactDialog } from '@/components/forms/AddContactDialog';
import { AddCompanyDialog } from '@/components/forms/AddCompanyDialog';
import { AddOpportunityDialog } from '@/components/forms/AddOpportunityDialog';
import { useOfflineFirst } from '@/hooks/useOfflineFirst';
import { apiService } from '@/services/api';

interface HeaderProps {
  onMenuToggle?: () => void;
  className?: string;
}

const notifications = [
  {
    id: '1',
    title: 'New lead assigned',
    message: 'John Doe from Acme Corp has been assigned to you',
    time: '2 minutes ago',
    type: 'lead',
    isRead: false
  },
  {
    id: '2',
    title: 'Meeting reminder',
    message: 'Sales call with TechCorp in 30 minutes',
    time: '28 minutes ago',
    type: 'meeting',
    isRead: false
  },
  {
    id: '3',
    title: 'Deal closed',
    message: 'Opportunity "Enterprise Software" marked as won',
    time: '1 hour ago',
    type: 'deal',
    isRead: true
  }
];

const quickActions = [
  { label: 'New Lead', icon: User, key: 'lead' },
  { label: 'New Contact', icon: Users, key: 'contact' },
  { label: 'New Company', icon: Building, key: 'company' },
  { label: 'New Opportunity', icon: Target, key: 'opportunity' }
];

export function Header({ onMenuToggle, className }: HeaderProps) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data hooks for global add functionality
  const leads = useOfflineFirst({
    tableName: 'leads',
    apiMethods: {
      getAll: () => apiService.getLeads(),
      create: apiService.createLead.bind(apiService),
      update: apiService.updateLead.bind(apiService),
      delete: apiService.deleteLead.bind(apiService)
    }
  });
  
  const contacts = useOfflineFirst({
    tableName: 'contacts',
    apiMethods: {
      getAll: () => apiService.getContacts(),
      create: apiService.createContact.bind(apiService),
      update: apiService.updateContact.bind(apiService),
      delete: apiService.deleteContact.bind(apiService)
    }
  });
  
  const companies = useOfflineFirst({
    tableName: 'companies',
    apiMethods: {
      getAll: () => apiService.getCompanies(),
      create: apiService.createCompany.bind(apiService),
      update: apiService.updateCompany.bind(apiService),
      delete: apiService.deleteCompany.bind(apiService)
    }
  });
  
  const opportunities = useOfflineFirst({
    tableName: 'opportunities',
    apiMethods: {
      getAll: () => apiService.getOpportunities(),
      create: apiService.createOpportunity.bind(apiService),
      update: apiService.updateOpportunity.bind(apiService),
      delete: apiService.deleteOpportunity.bind(apiService)
    }
  });

  // Mock user data - would come from auth context in real app
  const user = {
    name: 'Alex Thompson',
    email: 'alex.thompson@company.com',
    avatar: '',
    role: 'Sales Manager'
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    // Handle logout logic
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markNotificationAsRead = (id: string) => {
    // In real app, would update notification status
    console.log('Mark notification as read:', id);
  };

  return (
    <header className={cn("flex h-16 items-center justify-between border-b bg-background px-6", className)}>
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads, contacts, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 pl-9 h-9"
          />
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {/* Quick Actions */}
        <Popover open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              <AddLeadDialog onAdd={leads.actions.create}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsQuickActionsOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  New Lead
                </Button>
              </AddLeadDialog>
              
              <AddContactDialog 
                onAdd={contacts.actions.create}
                companies={companies.data?.map(c => ({ 
                  id: c.id || c.serverId || '', 
                  name: (c as any).name 
                })).filter(c => c.id && c.name) || []}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsQuickActionsOpen(false)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  New Contact
                </Button>
              </AddContactDialog>

              <AddCompanyDialog onAdd={companies.actions.create}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsQuickActionsOpen(false)}
                >
                  <Building className="h-4 w-4 mr-2" />
                  New Company
                </Button>
              </AddCompanyDialog>

              <AddOpportunityDialog
                onAdd={opportunities.actions.create}
                contacts={contacts.data?.filter(c => (c as any).firstName && (c as any).lastName).map(c => ({ 
                  id: c.id || c.serverId || '', 
                  firstName: (c as any).firstName, 
                  lastName: (c as any).lastName 
                })) || []}
                companies={companies.data?.filter(c => (c as any).name).map(c => ({ 
                  id: c.id || c.serverId || '', 
                  name: (c as any).name 
                })) || []}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsQuickActionsOpen(false)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  New Opportunity
                </Button>
              </AddOpportunityDialog>
            </div>
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                You have {unreadNotifications} unread notifications
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                    !notification.isRead && "bg-primary/5"
                  )}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      !notification.isRead ? "bg-primary" : "bg-muted"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/notifications')}
              >
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}