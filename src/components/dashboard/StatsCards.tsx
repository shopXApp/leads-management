import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Target, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Minus 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  data: {
    totalLeads: number;
    totalContacts: number;
    totalCompanies: number;
    totalOpportunities: number;
    totalRevenue: number;
    conversionRate: number;
  };
}

const statsConfig = [
  {
    title: 'Total Leads',
    key: 'totalLeads' as const,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    trend: { value: 12, type: 'up' as const },
    description: 'vs last month'
  },
  {
    title: 'Contacts',
    key: 'totalContacts' as const,
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    trend: { value: 8, type: 'up' as const },
    description: 'vs last month'
  },
  {
    title: 'Companies',
    key: 'totalCompanies' as const,
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    trend: { value: 3, type: 'up' as const },
    description: 'vs last month'
  },
  {
    title: 'Opportunities',
    key: 'totalOpportunities' as const,
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    trend: { value: 5, type: 'down' as const },
    description: 'vs last month'
  },
  {
    title: 'Revenue',
    key: 'totalRevenue' as const,
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    trend: { value: 18, type: 'up' as const },
    description: 'vs last month',
    format: 'currency'
  },
  {
    title: 'Conversion Rate',
    key: 'conversionRate' as const,
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    trend: { value: 2.3, type: 'up' as const },
    description: 'vs last month',
    format: 'percentage'
  }
];

export function StatsCards({ data }: StatsCardsProps) {
  const formatValue = (value: number, format?: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    
    return value.toLocaleString();
  };

  const getTrendIcon = (type: 'up' | 'down' | 'neutral') => {
    switch (type) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (type: 'up' | 'down' | 'neutral') => {
    switch (type) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = getTrendIcon(stat.trend.type);
        const value = data[stat.key];

        return (
          <Card key={stat.key} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-md", stat.bgColor)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">
                {formatValue(value, stat.format)}
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn("flex items-center space-x-1", getTrendColor(stat.trend.type))}>
                  <TrendIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">
                    {stat.trend.value}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
            
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/20 -z-10" />
          </Card>
        );
      })}
    </div>
  );
}