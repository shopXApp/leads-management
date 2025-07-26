import { useState, useEffect } from 'react';
import { Plus, Mail, Phone, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, ActivityType } from '@/types/crm';
import { apiService } from '@/services/api';

const Communications = () => {
  const [communications, setCommunications] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCommunications();
  }, [activeTab]);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const params = {
        type: activeTab !== 'all' ? activeTab : undefined,
      };
      const response = await apiService.getActivities(params);
      // Filter only communication types
      const commTypes = [ActivityType.Email, ActivityType.Call, ActivityType.SMS];
      setCommunications(response.data.filter(a => commTypes.includes(a.type)));
    } catch (error) {
      console.error('Failed to fetch communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCommIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.Email: return Mail;
      case ActivityType.Call: return Phone;
      case ActivityType.SMS: return MessageSquare;
      default: return Mail;
    }
  };

  const getCommBadgeVariant = (type: ActivityType) => {
    switch (type) {
      case ActivityType.Email: return 'default';
      case ActivityType.Call: return 'secondary';
      case ActivityType.SMS: return 'outline';
      default: return 'default';
    }
  };

  const emailCount = communications.filter(c => c.type === ActivityType.Email).length;
  const callCount = communications.filter(c => c.type === ActivityType.Call).length;
  const smsCount = communications.filter(c => c.type === ActivityType.SMS).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Send SMS
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Log Communication
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailCount}</div>
            <p className="text-xs text-muted-foreground">
              Email communications
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callCount}</div>
            <p className="text-xs text-muted-foreground">
              Phone calls logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsCount}</div>
            <p className="text-xs text-muted-foreground">
              Text messages sent
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Communications</TabsTrigger>
          <TabsTrigger value={ActivityType.Email}>Emails</TabsTrigger>
          <TabsTrigger value={ActivityType.Call}>Calls</TabsTrigger>
          <TabsTrigger value={ActivityType.SMS}>SMS</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                View all communication activities with your contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : communications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No communications found
                  </div>
                ) : (
                  communications.map((comm) => {
                    const IconComponent = getCommIcon(comm.type);
                    return (
                      <div 
                        key={comm.id} 
                        className="flex items-start space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{comm.subject}</h4>
                              <Badge variant={getCommBadgeVariant(comm.type)}>
                                {comm.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(comm.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {comm.description && (
                            <p className="text-sm text-muted-foreground">
                              {comm.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {comm.assignedTo && (
                              <span>
                                By: {comm.assignedTo.firstName} {comm.assignedTo.lastName}
                              </span>
                            )}
                            {comm.dueDate && (
                              <span>
                                Due: {new Date(comm.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {comm.isCompleted && (
                              <Badge variant="outline" className="text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communications;