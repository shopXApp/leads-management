/**
 * Communication History Component
 * 
 * Displays all communication logs for a lead with filtering capabilities.
 * Shows data from IndexedDB with sync status indicators.
 */

import { useState, useEffect } from 'react';
import { Calendar, Filter, Phone, Mail, MessageSquare, Users, FileText, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CommunicationLog } from '@/services/syncService';
import { indexedDBService } from '@/services/indexeddb';
import { CommunicationForm } from './CommunicationForm';
import { toast } from '@/components/ui/use-toast';

interface CommunicationHistoryProps {
  leadId: string | number;
  className?: string;
}

interface Filters {
  type: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

const communicationTypes = [
  { value: 'notes', label: 'Notes', icon: FileText, color: 'blue' },
  { value: 'call', label: 'Phone Call', icon: Phone, color: 'green' },
  { value: 'email', label: 'Email', icon: Mail, color: 'purple' },
  { value: 'sms', label: 'SMS', icon: MessageSquare, color: 'yellow' },
  { value: 'meeting', label: 'Meeting', icon: Users, color: 'red' },
] as const;

export function CommunicationHistory({ leadId, className }: CommunicationHistoryProps) {
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [filteredCommunications, setFilteredCommunications] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCommunication, setEditingCommunication] = useState<CommunicationLog | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    loadCommunications();
  }, [leadId]);

  useEffect(() => {
    applyFilters();
  }, [communications, filters]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      await indexedDBService.init();
      
      const allCommunications = await indexedDBService.getByIndex<CommunicationLog>(
        'communicationLogs',
        'leadId',
        leadId
      );
      
      // Sort by timestamp (newest first)
      const sortedCommunications = allCommunications.sort((a, b) => b.timestamp - a.timestamp);
      setCommunications(sortedCommunications);
    } catch (error) {
      console.error('Failed to load communications:', error);
      toast({
        title: "Failed to load communications",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...communications];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(comm => comm.type === filters.type);
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      filtered = filtered.filter(comm => comm.timestamp >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime() + (24 * 60 * 60 * 1000); // End of day
      filtered = filtered.filter(comm => comm.timestamp <= toDate);
    }

    // Filter by search text
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(comm => 
        comm.notes.toLowerCase().includes(searchTerm) ||
        comm.comments?.some(comment => comment.toLowerCase().includes(searchTerm))
      );
    }

    setFilteredCommunications(filtered);
  };

  const handleEdit = (communication: CommunicationLog) => {
    setEditingCommunication(communication);
    setShowEditDialog(true);
  };

  const handleDelete = async (communication: CommunicationLog) => {
    if (!communication.localId) return;

    try {
      await indexedDBService.delete('communicationLogs', communication.localId);
      
      // Add to sync queue if it has a server ID
      if (communication.serverId) {
        await indexedDBService.addToSyncQueue({
          tableName: 'communicationLogs',
          operation: 'DELETE',
          localId: communication.localId,
          serverId: communication.serverId
        });
      }
      
      await loadCommunications();
      
      toast({
        title: "Communication deleted",
        description: navigator.onLine ? 
          "Deleted and will sync with server" : 
          "Deleted locally and will sync when back online"
      });
    } catch (error) {
      console.error('Failed to delete communication:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = communicationTypes.find(t => t.value === type);
    return typeInfo?.icon || FileText;
  };

  const getTypeColor = (type: string) => {
    const typeInfo = communicationTypes.find(t => t.value === type);
    return typeInfo?.color || 'blue';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">Loading communications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Communication History</span>
          <Badge variant="outline">{communications.length}</Badge>
        </CardTitle>
        <CardDescription>
          All communications logged for this lead
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type</Label>
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {communicationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-from">From Date</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-to">To Date</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search notes..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>

        {/* Communications List */}
        <ScrollArea className="h-[400px]">
          {filteredCommunications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {communications.length === 0 ? 
                'No communications logged yet' : 
                'No communications match the current filters'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommunications.map((communication, index) => {
                const Icon = getTypeIcon(communication.type);
                const color = getTypeColor(communication.type);
                
                return (
                  <div key={communication.localId || index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                          <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
                        </div>
                        <div>
                          <Badge variant="outline" className={`text-${color}-600 border-${color}-200`}>
                            {communication.type}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(communication.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!communication.serverId && (
                          <Badge variant="secondary" className="text-xs">
                            Pending Sync
                          </Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(communication)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(communication)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pl-11">
                      <p className="text-sm">{communication.notes}</p>
                      
                      {communication.comments && communication.comments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <Label className="text-xs text-muted-foreground">Comments:</Label>
                          {communication.comments.map((comment, i) => (
                            <div key={i} className="text-xs bg-muted p-2 rounded">
                              {comment}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Communication</DialogTitle>
          </DialogHeader>
          {editingCommunication && (
            <CommunicationForm
              leadId={leadId}
              initialData={editingCommunication}
              onSaved={() => {
                setShowEditDialog(false);
                setEditingCommunication(null);
                loadCommunications();
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingCommunication(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default CommunicationHistory;