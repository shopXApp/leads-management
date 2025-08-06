import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@/types/crm';

interface LeadStatusDropdownProps {
  currentStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
}

export const LeadStatusDropdown = ({ currentStatus, onStatusChange }: LeadStatusDropdownProps) => {
  const getStatusVariant = (status: LeadStatus) => {
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
    <Select value={currentStatus} onValueChange={(value: LeadStatus) => onStatusChange(value)}>
      <SelectTrigger className="w-auto">
        <Badge variant={getStatusVariant(currentStatus)} className="mr-2">
          {currentStatus}
        </Badge>
        <ChevronDown className="h-3 w-3" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(LeadStatus).map((status) => (
          <SelectItem key={status} value={status}>
            <Badge variant={getStatusVariant(status)}>
              {status}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};