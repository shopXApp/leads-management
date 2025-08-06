import { useState } from 'react';
import { Filter, Clock, Phone, Mail, MessageSquare, FileText, DollarSign, CheckCircle2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityItem {
  id: string;
  type: 'status_change' | 'task' | 'email' | 'call' | 'note' | 'opportunity';
  title: string;
  description?: string;
  user: string;
  userInitials: string;
  timestamp: string;
  metadata?: {
    from?: string;
    to?: string;
    subject?: string;
    amount?: number;
    confidence?: number;
    duration?: string;
  };
}

interface ActivityTimelineProps {
  leadId: string;
}

export const ActivityTimeline = ({ leadId }: ActivityTimelineProps) => {
  const [userFilter, setUserFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'status_change',
      title: 'Status changed',
      description: 'Potential → Voicemail',
      user: 'Sarfaq Khan',
      userInitials: 'SK',
      timestamp: '15h ago',
      metadata: { from: 'Potential', to: 'Voicemail' }
    },
    {
      id: '2',
      type: 'call',
      title: 'Called Jeff Robertson',
      description: 'Jeff Robertson answered the call with the word "Foreign."',
      user: 'Sarfaq Khan',
      userInitials: 'SK',
      timestamp: '15h ago',
      metadata: { duration: '0:41' }
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Opportunity created',
      description: 'Corporate event planning for Q1 conference',
      user: 'John Doe',
      userInitials: 'JD',
      timestamp: '1d ago',
      metadata: { amount: 25000, confidence: 75 }
    },
    {
      id: '4',
      type: 'email',
      title: 'Email sent',
      description: 'Follow-up on event planning requirements',
      user: 'Jane Smith',
      userInitials: 'JS',
      timestamp: '2d ago',
      metadata: { subject: 'Follow-up on event planning requirements' }
    },
    {
      id: '5',
      type: 'task',
      title: 'Task assigned',
      description: 'Follow up on initial contact',
      user: 'John Doe',
      userInitials: 'JD',
      timestamp: '3d ago'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <Clock className="h-4 w-4" />;
      case 'task': return <CheckCircle2 className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'opportunity': return <DollarSign className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'status_change': return 'text-blue-600';
      case 'task': return 'text-green-600';
      case 'email': return 'text-purple-600';
      case 'call': return 'text-orange-600';
      case 'note': return 'text-gray-600';
      case 'opportunity': return 'text-emerald-600';
      default: return 'text-gray-600';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (userFilter !== 'all' && activity.user !== userFilter) return false;
    if (typeFilter !== 'all' && activity.type !== typeFilter) return false;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Timeline</CardTitle>
          <div className="flex space-x-2">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="Sarfaq Khan">Sarfaq Khan</SelectItem>
                <SelectItem value="John Doe">John Doe</SelectItem>
                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="status_change">Status</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="opportunity">Opportunities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="flex space-x-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-card ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < filteredActivities.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {activity.metadata?.duration && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.duration}
                          </Badge>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      )}
                      {activity.metadata?.subject && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Subject: {activity.metadata.subject}
                        </p>
                      )}
                      {activity.metadata?.amount && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount: ${activity.metadata.amount.toLocaleString()} 
                          {activity.metadata.confidence && ` (${activity.metadata.confidence}% confidence)`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                          {activity.userInitials}
                        </div>
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};