import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Opportunity, OpportunityStage } from "@/types/crm";

interface AddOpportunityDialogProps {
  onAdd: (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  contacts: Array<{ id: string; firstName: string; lastName: string; }>;
  companies: Array<{ id: string; name: string; }>;
}

export function AddOpportunityDialog({ onAdd, contacts, companies }: AddOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    stage: "" as OpportunityStage | "",
    probability: "",
    closeDate: "",
    contactId: "",
    companyId: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAdd({
        title: formData.name,
        description: formData.description,
        stage: formData.stage as OpportunityStage,
        amount: parseFloat(formData.amount),
        probability: formData.probability ? parseInt(formData.probability) : undefined,
        closeDate: formData.closeDate || undefined,
        contactId: formData.contactId || undefined,
        companyId: formData.companyId || undefined,
      });
      
      setFormData({
        name: "",
        amount: "",
        stage: "",
        probability: "",
        closeDate: "",
        contactId: "",
        companyId: "",
        description: "",
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Opportunity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Opportunity Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value as OpportunityStage })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OpportunityStage.Prospecting}>Prospecting</SelectItem>
                  <SelectItem value={OpportunityStage.Qualification}>Qualification</SelectItem>
                  <SelectItem value={OpportunityStage.Proposal}>Proposal</SelectItem>
                  <SelectItem value={OpportunityStage.Negotiation}>Negotiation</SelectItem>
                  <SelectItem value={OpportunityStage.Won}>Won</SelectItem>
                  <SelectItem value={OpportunityStage.Lost}>Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeDate">Close Date</Label>
              <Input
                id="closeDate"
                type="date"
                value={formData.closeDate}
                onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Opportunity"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}