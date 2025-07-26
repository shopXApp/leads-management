import { useState } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  entityType?: string;
  entityId?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Deal Closed',
      message: 'John Smith closed the Acme Corp deal worth $50,000',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      isImportant: true,
      entityType: 'opportunity',
      entityId: 'opp-1'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Task Overdue',
      message: 'Follow up call with Jane Doe is 2 days overdue',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: false,
      isImportant: true,
      entityType: 'activity',
      entityId: 'act-1'
    },
    {
      id: '3',
      type: 'info',
      title: 'New Lead Assigned',
      message: 'You have been assigned a new lead: TechCorp Industries',
      timestamp: '2024-01-15T08:45:00Z',
      isRead: true,
      isImportant: false,
      entityType: 'lead',
      entityId: 'lead-1'
    },
    {
      id: '4',
      type: 'error',
      title: 'Email Delivery Failed',
      message: 'Failed to send welcome email to customer@example.com',
      timestamp: '2024-01-14T16:20:00Z',
      isRead: false,
      isImportant: false,
      entityType: 'communication',
      entityId: 'email-1'
    },
    {
      id: '5',
      type: 'success',
      title: 'Lead Converted',
      message: 'Lead Sarah Johnson has been converted to a contact',
      timestamp: '2024-01-14T14:10:00Z',
      isRead: true,
      isImportant: false,
      entityType: 'lead',
      entityId: 'lead-2'
    }
  ]);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return X;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);
  const importantNotifications = notifications.filter(n => n.isImportant);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Notifications to review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Important</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{importantCount}</div>
            <p className="text-xs text-muted-foreground">
              High priority notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              All notifications
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="unread" className="space-y-4">
            <TabsList>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="important">Important</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No unread notifications</p>
                  </CardContent>
                </Card>
              ) : (
                unreadNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <Card key={notification.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            notification.type === 'success' ? 'bg-green-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            notification.type === 'error' ? 'bg-red-100' :
                            'bg-blue-100'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              notification.type === 'success' ? 'text-green-600' :
                              notification.type === 'warning' ? 'text-yellow-600' :
                              notification.type === 'error' ? 'text-red-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium flex items-center space-x-2">
                                {notification.title}
                                {notification.isImportant && (
                                  <Badge variant="destructive" className="text-xs">Important</Badge>
                                )}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getNotificationBadgeVariant(notification.type)}>
                                {notification.type}
                              </Badge>
                              {notification.entityType && (
                                <Badge variant="outline">
                                  {notification.entityType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="important" className="space-y-4">
              {importantNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <Card key={notification.id} className="border-l-4 border-l-destructive">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <IconComponent className="h-5 w-5 text-destructive mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="destructive">Important</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <Card key={notification.id} className={!notification.isRead ? 'border-l-2 border-l-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <IconComponent className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <h4 className={`font-medium ${!notification.isRead ? 'text-primary' : ''}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex space-x-1">
                              <Badge variant={getNotificationBadgeVariant(notification.type)}>
                                {notification.type}
                              </Badge>
                              {notification.isImportant && (
                                <Badge variant="destructive">Important</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {readNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <Card key={notification.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <IconComponent className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline">Read</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications
                  </p>
                </div>
                <Switch 
                  checked={pushNotifications} 
                  onCheckedChange={setPushNotifications} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Check className="mr-2 h-4 w-4" />
                Mark All as Read
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <X className="mr-2 h-4 w-4" />
                Clear All Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;