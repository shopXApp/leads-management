import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Calendar,
  TrendingUp,
  Users,
  Target,
  Phone,
  Mail
} from 'lucide-react';
import { Dashboard as DashboardData, Activity, ActivityType, LeadStatus, OpportunityStage } from '@/types/crm';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - replace with actual API calls
  const mockDashboardData: DashboardData = {
    totalLeads: 1247,
    totalContacts: 892,
    totalCompanies: 156,
    totalOpportunities: 89,
    totalRevenue: 2340000,
    conversionRate: 24.8,
    recentActivities: [
      {
        id: '1',
        type: ActivityType.Call,
        subject: 'Follow-up call with John Smith',
        description: 'Discussed pricing and implementation timeline for Q1 2024',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        isCompleted: false,
        leadId: 'lead-1',
        assignedToId: 'user-1',
        assignedTo: {
          id: 'user-1',
          email: 'sarah@company.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'Sales' as any,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        type: ActivityType.Email,
        subject: 'Proposal sent to Acme Corp',
        description: 'Sent updated proposal with 15% discount for enterprise package',
        dueDate: undefined,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        leadId: 'lead-2',
        assignedToId: 'user-2',
        assignedTo: {
          id: 'user-2',
          email: 'mike@company.com',
          firstName: 'Mike',
          lastName: 'Chen',
          role: 'Sales' as any,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        type: ActivityType.Meeting,
        subject: 'Demo scheduled with TechStart Inc',
        description: 'Product demo for their 50-person team, focus on integrations',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isCompleted: false,
        leadId: 'lead-3',
        assignedToId: 'user-1',
        assignedTo: {
          id: 'user-1',
          email: 'sarah@company.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'Sales' as any,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        type: ActivityType.Task,
        subject: 'Update CRM with competitor analysis',
        description: 'Research and document competitor pricing for deals above $50k',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isCompleted: false,
        leadId: undefined,
        assignedToId: 'user-3',
        assignedTo: {
          id: 'user-3',
          email: 'alex@company.com',
          firstName: 'Alex',
          lastName: 'Rodriguez',
          role: 'Manager' as any,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    leadsByStatus: [
      { status: LeadStatus.New, count: 234 },
      { status: LeadStatus.Contacted, count: 189 },
      { status: LeadStatus.Qualified, count: 156 },
      { status: LeadStatus.Proposal, count: 98 },
      { status: LeadStatus.Won, count: 432 },
      { status: LeadStatus.Lost, count: 138 }
    ],
    opportunitiesByStage: [
      { stage: OpportunityStage.Prospecting, count: 15, value: 125000 },
      { stage: OpportunityStage.Qualification, count: 23, value: 340000 },
      { stage: OpportunityStage.NeedsAnalysis, count: 18, value: 280000 },
      { stage: OpportunityStage.Proposal, count: 12, value: 450000 },
      { stage: OpportunityStage.Negotiation, count: 8, value: 320000 },
      { stage: OpportunityStage.ClosedWon, count: 45, value: 1200000 },
      { stage: OpportunityStage.ClosedLost, count: 28, value: 0 }
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 180000, target: 200000 },
      { month: 'Feb', revenue: 220000, target: 200000 },
      { month: 'Mar', revenue: 190000, target: 210000 },
      { month: 'Apr', revenue: 280000, target: 220000 },
      { month: 'May', revenue: 320000, target: 250000 },
      { month: 'Jun', revenue: 290000, target: 260000 },
      { month: 'Jul', revenue: 410000, target: 300000 },
      { month: 'Aug', revenue: 380000, target: 320000 },
      { month: 'Sep', revenue: 450000, target: 350000 },
      { month: 'Oct', revenue: 520000, target: 400000 },
      { month: 'Nov', revenue: 480000, target: 420000 },
      { month: 'Dec', revenue: 580000, target: 500000 }
    ]
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDashboardData(mockDashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your sales pipeline.
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <StatsCards data={dashboardData} />

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ChartsSection 
            leadsByStatus={dashboardData.leadsByStatus}
            opportunitiesByStage={dashboardData.opportunitiesByStage}
            revenueByMonth={dashboardData.revenueByMonth}
          />
        </div>
        
        <div className="space-y-6">
          <RecentActivity activities={dashboardData.recentActivities} />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add New Lead
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Target className="mr-2 h-4 w-4" />
                Create Opportunity
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Log Call Activity
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Send Email Campaign
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calls Made</span>
                <Badge variant="secondary">127</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Emails Sent</span>
                <Badge variant="secondary">89</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meetings</span>
                <Badge variant="secondary">34</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deals Closed</span>
                <Badge variant="default">12</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}