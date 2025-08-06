import { useState } from 'react';
import { Plus, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddOpportunityDialog } from '@/components/lead-details/AddOpportunityDialog';

interface Opportunity {
  id: string;
  amount: number;
  amountType: 'one-time' | 'monthly' | 'yearly';
  status: string;
  closeDate: string;
  confidence: number;
  assignedTo: string;
  contactPerson?: string;
  description?: string;
  createdAt: string;
}

interface OpportunitiesSectionProps {
  leadId: string;
}

export const OpportunitiesSection = ({ leadId }: OpportunitiesSectionProps) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: '1',
      amount: 25000,
      amountType: 'one-time',
      status: 'Proposal',
      closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 75,
      assignedTo: 'John Doe',
      contactPerson: 'Jeff Robertson',
      description: 'Corporate event planning for Q1 conference',
      createdAt: new Date().toISOString(),
    }
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddOpportunity = (opportunityData: Omit<Opportunity, 'id' | 'createdAt'>) => {
    const newOpportunity: Opportunity = {
      ...opportunityData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setOpportunities([...opportunities, newOpportunity]);
    setShowAddDialog(false);
  };

  const handleDeleteOpportunity = (opportunityId: string) => {
    setOpportunities(opportunities.filter(opp => opp.id !== opportunityId));
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
    
    const suffix = type === 'monthly' ? '/mo' : type === 'yearly' ? '/yr' : '';
    return formatted + suffix;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <DollarSign className="h-4 w-4 mr-2" />
          Opportunities ({opportunities.length})
        </CardTitle>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Opportunity</DialogTitle>
            </DialogHeader>
            <AddOpportunityDialog onAdd={handleAddOpportunity} onCancel={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No opportunities yet</p>
        ) : (
          opportunities.map((opportunity) => (
            <div key={opportunity.id} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-lg">
                    {formatAmount(opportunity.amount, opportunity.amountType)}
                  </span>
                  <Badge variant="outline">
                    {opportunity.status}
                  </Badge>
                </div>
                {opportunity.description && (
                  <div className="text-sm text-muted-foreground">{opportunity.description}</div>
                )}
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Confidence: {opportunity.confidence}%</span>
                  <span>Close: {new Date(opportunity.closeDate).toLocaleDateString()}</span>
                  <span>Assigned: {opportunity.assignedTo}</span>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteOpportunity(opportunity.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};