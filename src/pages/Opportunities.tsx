import { useState } from 'react';
import { Plus, Search, Filter, RefreshCw, Target, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Opportunity, OpportunityStage, Contact, Company } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';
import { AddOpportunityDialog } from '@/components/forms/AddOpportunityDialog';
import { EditOpportunityDialog } from '@/components/forms/EditOpportunityDialog';
import { apiService } from '@/services/api';
import { useOfflineFirst } from '@/hooks/useOfflineFirst';
import SyncStatus from '@/components/ui/sync-status';

const Opportunities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { 
    data: opportunities, 
    loading, 
    syncStatus, 
    error,
    actions 
  } = useOfflineFirst<Opportunity>({
    tableName: 'opportunities',
    apiMethods: {
      getAll: (params) => apiService.getOpportunities(params),
      create: (data) => apiService.createOpportunity(data),
      update: (id, data) => apiService.updateOpportunity(id, data),
      delete: (id) => apiService.deleteOpportunity(id)
    }
  });

  const { data: contacts } = useOfflineFirst<Contact>({
    tableName: 'contacts',
    apiMethods: {
      getAll: (params) => apiService.getContacts(params),
      create: (data) => apiService.createContact(data),
      update: (id, data) => apiService.updateContact(id, data),
      delete: (id) => apiService.deleteContact(id)
    }
  });

  const { data: companies } = useOfflineFirst<Company>({
    tableName: 'companies',
    apiMethods: {
      getAll: (params) => apiService.getCompanies(params),
      create: (data) => apiService.createCompany(data),
      update: (id, data) => apiService.updateCompany(id, data),
      delete: (id) => apiService.deleteCompany(id)
    }
  });

  const handleSearch = () => {
    actions.refresh();
  };

  const getStageBadgeVariant = (stage: OpportunityStage) => {
    switch (stage) {
      case OpportunityStage.Lead: return 'secondary';
      case OpportunityStage.Qualified: return 'outline';
      case OpportunityStage.Proposal: return 'default';
      case OpportunityStage.Negotiation: return 'secondary';
      case OpportunityStage.Won: return 'default';
      case OpportunityStage.Lost: return 'destructive';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Opportunities</h2>
          <SyncStatus showDetails={false} />
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={actions.refresh}
            disabled={loading || !syncStatus.isOnline}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <AddOpportunityDialog 
            onAdd={async (data) => await actions.create(data)} 
            contacts={contacts.map(c => ({ id: (c.id || c.localId!.toString()), firstName: c.firstName, lastName: c.lastName }))}
            companies={companies.map(c => ({ id: (c.id || c.localId!.toString()), name: c.name }))}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(opp => 
                opp.stage !== OpportunityStage.Won && opp.stage !== OpportunityStage.Lost
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(opp => opp.stage === OpportunityStage.Won).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <Filter className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Opportunities</CardTitle>
          <CardDescription>
            Manage your sales pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Created</TableHead>
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
                  <TableRow key={opportunity.localId || opportunity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {opportunity.description}
                        </div>
                        {!opportunity.serverId && (
                          <div className="text-xs text-muted-foreground">Local only</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {opportunity.contact ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(opportunity.contact.firstName, opportunity.contact.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {opportunity.contact.firstName} {opportunity.contact.lastName}
                          </span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{opportunity.company?.name || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {opportunity.amount ? formatCurrency(opportunity.amount) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStageBadgeVariant(opportunity.stage)}>
                        {opportunity.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {opportunity.closeDate ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(opportunity.closeDate)}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {opportunity.createdAt ? formatDate(opportunity.createdAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditOpportunityDialog
        opportunity={editingOpportunity}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={async (data) => await actions.update((data.localId || data.id!) as number, data)}
        contacts={contacts.map(c => ({ id: (c.id || c.localId!.toString()), firstName: c.firstName, lastName: c.lastName }))}
        companies={companies.map(c => ({ id: (c.id || c.localId!.toString()), name: c.name }))}
      />
    </div>
  );
};

export default Opportunities;