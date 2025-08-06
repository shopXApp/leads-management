import { MapPin, Globe, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lead } from '@/types/crm';

interface AboutSectionProps {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}

export const AboutSection = ({ lead }: AboutSectionProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Building2 className="h-4 w-4 mr-2" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lead.address && (
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm">
              {lead.address.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        )}
        
        {lead.website && (
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a 
              href={lead.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {lead.website.replace('https://', '').replace('http://', '')}
            </a>
          </div>
        )}
        
        {lead.description && (
          <div className="text-sm text-muted-foreground mt-3">
            {lead.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};