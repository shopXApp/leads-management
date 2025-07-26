import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  MessageSquare,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Activity, ActivityType } from '@/types/crm';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  activities: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case ActivityType.Call:
      return Phone;
    case ActivityType.Email:
      return Mail;
    case ActivityType.Meeting:
      return Calendar;
    case ActivityType.Task:
      return FileText;
    case ActivityType.SMS:
      return MessageSquare;
    default:
      return FileText;
  }
};

const getActivityColor = (type: ActivityType) => {
  switch (type) {
    case ActivityType.Call:
      return 'bg-blue-100 text-blue-700';
    case ActivityType.Email:
      return 'bg-green-100 text-green-700';
    case ActivityType.Meeting:
      return 'bg-purple-100 text-purple-700';
    case ActivityType.Task:
      return 'bg-orange-100 text-orange-700';
    case ActivityType.SMS:
      return 'bg-pink-100 text-pink-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusColor = (isCompleted: boolean, dueDate?: string) => {
  if (isCompleted) {
    return 'bg-green-100 text-green-800';
  }
  
  if (dueDate && new Date(dueDate) < new Date()) {
    return 'bg-red-100 text-red-800';
  }
  
  return 'bg-yellow-100 text-yellow-800';
};

const getStatusText = (isCompleted: boolean, dueDate?: string) => {
  if (isCompleted) {
    return 'Completed';
  }
  
  if (dueDate && new Date(dueDate) < new Date()) {
    return 'Overdue';
  }
  
  return 'Pending';
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No recent activities</p>
            <p className="text-sm text-muted-foreground mt-2">
              Activities will appear here as you and your team work with leads and contacts.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Recent Activity
        </CardTitle>
        <Button variant="ghost" size="sm">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  getActivityColor(activity.type)
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {activity.subject}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          getStatusColor(activity.isCompleted, activity.dueDate)
                        )}
                      >
                        {getStatusText(activity.isCompleted, activity.dueDate)}
                      </Badge>
                    </div>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      {activity.assignedTo && (
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src="" alt={activity.assignedTo.firstName} />
                            <AvatarFallback className="text-xs">
                              {activity.assignedTo.firstName[0]}{activity.assignedTo.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.assignedTo.firstName} {activity.assignedTo.lastName}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {activity.dueDate && !activity.isCompleted && (
                        <span className="text-xs text-muted-foreground">
                          Due {format(new Date(activity.dueDate), 'MMM d')}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}