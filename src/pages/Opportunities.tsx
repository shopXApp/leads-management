import { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Opportunity, OpportunityStage } from '@/types/crm';
import { apiService } from '@/services/api';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOpportunities();
      setOpportunities(response.data);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadgeVariant = (stage: OpportunityStage) => {
    switch (stage) {
      case OpportunityStage.Prospecting: return 'secondary';
      case OpportunityStage.Qualification: return 'outline';
      case OpportunityStage.NeedsAnalysis: return 'secondary';
      case OpportunityStage.Proposal: return 'default';
      case OpportunityStage.Negotiation: return 'secondary';
      case OpportunityStage.ClosedWon: return 'default';
      case OpportunityStage.ClosedLost: return 'destructive';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const avgProbability = opportunities.length > 0 
    ? opportunities.reduce((sum, opp) => sum + opp.probability, 0) / opportunities.length 
    : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Opportunities</h2>
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Opportunity
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Across {opportunities.length} opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Probability</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProbability.toFixed(1)}%</div>
            <Progress value={avgProbability} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(o => !o.stage.includes('Closed')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Won</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(o => o.stage === OpportunityStage.ClosedWon).length}
            </div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <CardDescription>
            Track your sales opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : opportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No opportunities found</TableCell>
                </TableRow>
              ) : (
                opportunities.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        {opportunity.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {opportunity.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{opportunity.company?.name || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(opportunity.value)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStageBadgeVariant(opportunity.stage)}>
                        {opportunity.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={opportunity.probability} className="w-16" />
                        <span className="text-sm">{opportunity.probability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {opportunity.expectedCloseDate 
                        ? new Date(opportunity.expectedCloseDate).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {opportunity.assignedTo 
                        ? `${opportunity.assignedTo.firstName} ${opportunity.assignedTo.lastName}`
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Opportunities;