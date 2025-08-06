import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface AddOpportunityDialogProps {
  onAdd: (opportunity: {
    amount: number;
    amountType: 'one-time' | 'monthly' | 'yearly';
    status: string;
    closeDate: string;
    confidence: number;
    assignedTo: string;
    contactPerson?: string;
    description?: string;
  }) => void;
  onCancel: () => void;
}

export const AddOpportunityDialog = ({ onAdd, onCancel }: AddOpportunityDialogProps) => {
  const [formData, setFormData] = useState({
    amount: '',
    amountType: 'one-time' as 'one-time' | 'monthly' | 'yearly',
    status: '',
    closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    confidence: [50],
    assignedTo: '',
    contactPerson: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.status || !formData.assignedTo) return;
    
    onAdd({
      amount: parseFloat(formData.amount),
      amountType: formData.amountType,
      status: formData.status,
      closeDate: new Date(formData.closeDate).toISOString(),
      confidence: formData.confidence[0],
      assignedTo: formData.assignedTo,
      contactPerson: formData.contactPerson || undefined,
      description: formData.description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Estimate Amount *</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="25000"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountType">Amount Type</Label>
          <Select value={formData.amountType} onValueChange={(value: 'one-time' | 'monthly' | 'yearly') => setFormData({ ...formData, amountType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-time</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Opportunity Status *</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Prospecting">Prospecting</SelectItem>
            <SelectItem value="Qualification">Qualification</SelectItem>
            <SelectItem value="Proposal">Proposal</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Won">Won</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="closeDate">Estimate Close Date</Label>
        <Input
          id="closeDate"
          type="date"
          value={formData.closeDate}
          onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Confidence % ({formData.confidence[0]}%)</Label>
        <Slider
          value={formData.confidence}
          onValueChange={(value) => setFormData({ ...formData, confidence: value })}
          max={100}
          min={0}
          step={5}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigned To *</Label>
        <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="John Doe">John Doe</SelectItem>
            <SelectItem value="Jane Smith">Jane Smith</SelectItem>
            <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact Person</Label>
        <Select value={formData.contactPerson} onValueChange={(value) => setFormData({ ...formData, contactPerson: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select contact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Jeff Robertson">Jeff Robertson</SelectItem>
            <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Opportunity description"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Opportunity
        </Button>
      </div>
    </form>
  );
};