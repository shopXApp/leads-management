/**
 * Communication Form Component
 * 
 * Form for creating and editing communication logs for leads.
 * Supports offline-first storage and various communication types.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Phone, Mail, MessageSquare, Users, FileText } from 'lucide-react';
import { CommunicationLog } from '@/services/syncService';
import { indexedDBService } from '@/services/indexeddb';
import { toast } from '@/components/ui/use-toast';

interface CommunicationFormProps {
  leadId: string | number;
  initialData?: Partial<CommunicationLog>;
  onSaved?: (communication: CommunicationLog) => void;
  onCancel?: () => void;
}

const communicationTypes = [
  { value: 'notes', label: 'Notes', icon: FileText },
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Users },
] as const;

export function CommunicationForm({ 
  leadId, 
  initialData, 
  onSaved, 
  onCancel 
}: CommunicationFormProps) {
  const [formData, setFormData] = useState<Partial<CommunicationLog>>({
    type: 'notes',
    notes: '',
    comments: [],
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.notes?.trim()) {
      toast({
        title: "Validation Error",
        description: "Notes are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const communicationData: CommunicationLog = {
        ...formData,
        leadId,
        timestamp: formData.timestamp || Date.now(),
        notes: formData.notes!,
        type: formData.type as CommunicationLog['type'],
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (initialData?.localId) {
        // Update existing
        await indexedDBService.update('communicationLogs', {
          ...communicationData,
          localId: initialData.localId
        });
        
        // Add to sync queue
        await indexedDBService.addToSyncQueue({
          tableName: 'communicationLogs',
          operation: 'UPDATE',
          localId: initialData.localId,
          data: communicationData,
          serverId: initialData.serverId
        });
      } else {
        // Create new
        const localId = await indexedDBService.add('communicationLogs', communicationData);
        
        // Add to sync queue
        await indexedDBService.addToSyncQueue({
          tableName: 'communicationLogs',
          operation: 'CREATE',
          localId,
          data: communicationData
        });
      }

      toast({
        title: initialData?.localId ? "Communication Updated" : "Communication Logged",
        description: navigator.onLine ? 
          "Saved and will sync with server" : 
          "Saved offline and will sync when back online"
      });

      onSaved?.(communicationData);
    } catch (error) {
      console.error('Failed to save communication:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment.trim()]
    }));
    setNewComment('');
  };

  const removeComment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      comments: prev.comments?.filter((_, i) => i !== index) || []
    }));
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = communicationTypes.find(t => t.value === type);
    if (!typeInfo) return FileText;
    return typeInfo.icon;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>{initialData?.localId ? 'Edit Communication' : 'Log Communication'}</span>
        </CardTitle>
        <CardDescription>
          Record communication activities for this lead
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Communication Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CommunicationLog['type'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select communication type" />
              </SelectTrigger>
              <SelectContent>
                {communicationTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes *</Label>
            <Textarea
              id="notes"
              placeholder="Enter communication details..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="datetime">Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={formData.timestamp ? 
                new Date(formData.timestamp).toISOString().slice(0, 16) : 
                new Date().toISOString().slice(0, 16)
              }
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                timestamp: new Date(e.target.value).getTime() 
              }))}
            />
          </div>

          {/* Comments Section */}
          <div className="space-y-2">
            <Label>Comments</Label>
            <div className="space-y-2">
              {formData.comments?.map((comment, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex-1 justify-start">
                    {comment}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComment(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addComment())}
                />
                <Button type="button" onClick={addComment} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (initialData?.localId ? 'Update' : 'Save')}
            </Button>
          </div>
          
          {/* Offline Indicator */}
          {!navigator.onLine && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">Offline</Badge>
              <span>Will sync when back online</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default CommunicationForm;