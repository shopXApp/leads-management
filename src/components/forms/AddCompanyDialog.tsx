import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { Company, CompanySize } from "@/types/crm";

interface AddCompanyDialogProps {
  onAdd: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  children?: React.ReactNode;
}

export function AddCompanyDialog({ onAdd, children }: AddCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "" as CompanySize | "",
    revenue: "",
    website: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAdd({
        ...formData,
        size: formData.size as CompanySize,
        revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
      });
      
      setFormData({
        name: "",
        industry: "",
        size: "",
        revenue: "",
        website: "",
        address: "",
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding company:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value as CompanySize })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CompanySize.Startup}>Startup (1-10)</SelectItem>
                  <SelectItem value={CompanySize.Small}>Small (11-50)</SelectItem>
                  <SelectItem value={CompanySize.Medium}>Medium (51-200)</SelectItem>
                  <SelectItem value={CompanySize.Large}>Large (201-1000)</SelectItem>
                  <SelectItem value={CompanySize.Enterprise}>Enterprise (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue</Label>
              <Input
                id="revenue"
                type="number"
                placeholder="0"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Company"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}