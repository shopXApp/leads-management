import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { LeadStatusCount, OpportunityStageCount, RevenueByMonth } from '@/types/crm';

interface ChartsSectionProps {
  leadsByStatus: LeadStatusCount[];
  opportunitiesByStage: OpportunityStageCount[];
  revenueByMonth: RevenueByMonth[];
}

const LEAD_STATUS_COLORS = {
  New: '#3b82f6',
  Contacted: '#8b5cf6',
  Qualified: '#06b6d4',
  Proposal: '#f59e0b',
  Won: '#10b981',
  Lost: '#ef4444'
};

const OPPORTUNITY_STAGE_COLORS = {
  Prospecting: '#6366f1',
  Qualification: '#8b5cf6',
  NeedsAnalysis: '#06b6d4',
  Proposal: '#f59e0b',
  Negotiation: '#f97316',
  ClosedWon: '#10b981',
  ClosedLost: '#ef4444'
};

export function ChartsSection({ 
  leadsByStatus, 
  opportunitiesByStage, 
  revenueByMonth 
}: ChartsSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-md p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' || entry.name === 'Target' 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg shadow-md p-3">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.color }}>
            Count: {data.value}
          </p>
          <p className="text-sm text-muted-foreground">
            {((data.value / leadsByStatus.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-sm text-muted-foreground"
              />
              <YAxis 
                className="text-sm text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#10b981' }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
                dot={{ fill: '#94a3b8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Leads by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Leads by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
              >
                {leadsByStatus.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={LEAD_STATUS_COLORS[entry.status as keyof typeof LEAD_STATUS_COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Opportunities by Stage */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={opportunitiesByStage} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number" 
                className="text-sm text-muted-foreground"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                type="category" 
                dataKey="stage" 
                className="text-sm text-muted-foreground"
                width={100}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'value' ? formatCurrency(value) : value,
                  name === 'value' ? 'Pipeline Value' : 'Count'
                ]}
              />
              <Bar 
                dataKey="value" 
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                name="value"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}