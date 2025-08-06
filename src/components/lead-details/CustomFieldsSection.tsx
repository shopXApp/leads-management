import { useState } from 'react';
import { Settings, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  value: string | number | boolean;
  options?: string[];
}

interface CustomFieldsSectionProps {
  leadId: string;
}

export const CustomFieldsSection = ({ leadId }: CustomFieldsSectionProps) => {
  const [customFields] = useState<CustomField[]>([
    {
      id: '1',
      name: 'Lead Owner',
      type: 'text',
      value: 'Sarfaq Khan'
    },
    {
      id: '2',
      name: 'No. of Employees',
      type: 'number',
      value: 50
    },
    {
      id: '3',
      name: 'Zip Code',
      type: 'text',
      value: '30067'
    },
    {
      id: '4',
      name: 'Tag',
      type: 'text',
      value: 'Event - Web Development'
    }
  ]);

  const renderFieldValue = (field: CustomField) => {
    switch (field.type) {
      case 'boolean':
        return (
          <Badge variant={field.value ? 'default' : 'secondary'}>
            {field.value ? 'Yes' : 'No'}
          </Badge>
        );
      case 'date':
        return new Date(field.value as string).toLocaleDateString();
      default:
        return field.value?.toString() || '-';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Custom Fields ({customFields.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {customFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom fields configured</p>
        ) : (
          customFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1 space-y-1">
                <div className="text-sm font-medium">{field.name}</div>
                <div className="text-sm text-muted-foreground">
                  {renderFieldValue(field)}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};