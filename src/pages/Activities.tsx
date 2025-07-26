import { useState, useEffect } from 'react';
import { Plus, Calendar, Phone, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, ActivityType } from '@/types/crm';
import { apiService } from '@/services/api';

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [activeTab]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = {
        type: activeTab !== 'all' ? activeTab : undefined,
      };
      const response = await apiService.getActivities(params);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.Call: return Phone;
      case ActivityType.Email: return Mail;
      case ActivityType.Meeting: return Calendar;
      case ActivityType.SMS: return MessageSquare;
      case ActivityType.Task: return CheckCircle;
      case ActivityType.Note: return MessageSquare;
      default: return Calendar;
    }
  };

  const getActivityBadgeVariant = (type: ActivityType) => {
    switch (type) {
      case ActivityType.Call: return 'default';
      case ActivityType.Email: return 'secondary';
      case ActivityType.Meeting: return 'outline';
      case ActivityType.SMS: return 'secondary';
      case ActivityType.Task: return 'default';
      case ActivityType.Note: return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (dueDate?: string) => {
    if (!dueDate) return 'text-muted-foreground';
    
    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'text-destructive';
    if (daysDiff === 0) return 'text-orange-500';
    if (daysDiff <= 1) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const completedCount = activities.filter(a => a.isCompleted).length;
  const overdueCount = activities.filter(a => 
    a.dueDate && new Date(a.dueDate) < new Date() && !a.isCompleted
  ).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Activities</h2>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              {activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {activities.filter(a => {
                if (!a.dueDate) return false;
                const due = new Date(a.dueDate);
                const today = new Date();
                return due.toDateString() === today.toDateString() && !a.isCompleted;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Today's tasks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value={ActivityType.Call}>Calls</TabsTrigger>
          <TabsTrigger value={ActivityType.Email}>Emails</TabsTrigger>
          <TabsTrigger value={ActivityType.Meeting}>Meetings</TabsTrigger>
          <TabsTrigger value={ActivityType.Task}>Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Activities' : `${activeTab}s`}
              </CardTitle>
              <CardDescription>
                {activeTab === 'all' 
                  ? 'View and manage all your activities'
                  : `Manage your ${activeTab.toLowerCase()} activities`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Related To</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No activities found</TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{activity.subject}</div>
                                {activity.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {activity.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActivityBadgeVariant(activity.type)}>
                              {activity.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={getPriorityColor(activity.dueDate)}>
                            {activity.dueDate 
                              ? new Date(activity.dueDate).toLocaleDateString()
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={activity.isCompleted ? 'default' : 'secondary'}>
                              {activity.isCompleted ? 'Completed' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {activity.assignedTo 
                              ? `${activity.assignedTo.firstName} ${activity.assignedTo.lastName}`
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {activity.leadId && 'Lead'}
                            {activity.contactId && 'Contact'}
                            {activity.opportunityId && 'Opportunity'}
                            {!activity.leadId && !activity.contactId && !activity.opportunityId && '-'}
                          </TableCell>
                          <TableCell>{new Date(activity.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Activities;