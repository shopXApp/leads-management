import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddTaskDialogProps {
  onAdd: (task: {
    title: string;
    description?: string;
    assignedTo: string;
    contactPerson?: string;
    dueDate: string;
  }) => void;
  onCancel: () => void;
}

export const AddTaskDialog = ({ onAdd, onCancel }: AddTaskDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    contactPerson: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assignedTo) return;
    
    onAdd({
      title: formData.title,
      description: formData.description || undefined,
      assignedTo: formData.assignedTo,
      contactPerson: formData.contactPerson || undefined,
      dueDate: new Date(formData.dueDate).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Task title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Task description"
          rows={3}
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
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Task
        </Button>
      </div>
    </form>
  );
};