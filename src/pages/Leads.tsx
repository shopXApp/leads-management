import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter, Download, Upload, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Lead, LeadStatus, LeadSource } from '@/types/crm';

// Extended Lead interface for offline-first functionality
interface OfflineLead extends Lead {
  localId?: number;
  serverId?: string;
}
import { apiService } from '@/services/api';
import { useOfflineFirst } from '@/hooks/useOfflineFirst';
import { SyncStatusIndicator } from '@/components/ui/sync-status';
import { CommunicationForm } from '@/components/communications/CommunicationForm';
import { CommunicationHistory } from '@/components/communications/CommunicationHistory';
import { AddLeadDialog } from '@/components/forms/AddLeadDialog';
import { toast } from '@/components/ui/use-toast';

const Leads = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<OfflineLead | null>(null);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);

  const { data: leads, loading, syncStatus, actions } = useOfflineFirst<OfflineLead>({
    tableName: 'leads',
    apiMethods: {
      getAll: (params) => apiService.getLeads(params),
      create: (data) => apiService.createLead(data),
      update: (id, data) => apiService.updateLead(id, data),
      delete: (id) => apiService.deleteLead(id)
    }
  });

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.New: return 'default';
      case LeadStatus.Contacted: return 'secondary';
      case LeadStatus.Qualified: return 'outline';
      case LeadStatus.Proposal: return 'secondary';
      case LeadStatus.Won: return 'default';
      case LeadStatus.Lost: return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <SyncStatusIndicator />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <AddLeadDialog onAdd={actions.create} />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search leads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(LeadStatus).map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.values(LeadSource).map((source) => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={actions.refresh}>
          <Filter className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
          <CardDescription>
            Manage and track your sales leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No leads found</TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.localId || lead.id}>
                    <TableCell className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.company || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>{lead.score || '-'}</TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowCommunicationDialog(true);
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Log
                        </Button>
                        {!lead.serverId && (
                          <Badge variant="secondary" className="text-xs">Offline</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Communications - {selectedLead?.firstName} {selectedLead?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CommunicationForm
              leadId={selectedLead?.localId || selectedLead?.serverId || ''}
              onSaved={() => {
                // Optionally refresh or update UI
              }}
            />
            <CommunicationHistory
              leadId={selectedLead?.localId || selectedLead?.id || ''}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;