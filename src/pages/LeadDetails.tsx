import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, Mail, Globe, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead, LeadStatus, LeadSource } from '@/types/crm';
import { apiService } from '@/services/api';
import { AboutSection } from '@/components/lead-details/AboutSection';
import { TasksSection } from '@/components/lead-details/TasksSection';
import { OpportunitiesSection } from '@/components/lead-details/OpportunitiesSection';
import { ContactsSection } from '@/components/lead-details/ContactsSection';
import { CustomFieldsSection } from '@/components/lead-details/CustomFieldsSection';
import { InteractionPanel } from '@/components/lead-details/InteractionPanel';
import { ActivityTimeline } from '@/components/lead-details/ActivityTimeline';
import { LeadStatusDropdown } from '@/components/lead-details/LeadStatusDropdown';
import { toast } from '@/hooks/use-toast';

const LeadDetails = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('note');

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId) return;
      
      try {
        setLoading(true);
        // For demo purposes, we'll create a mock lead if not found
        const mockLead: Lead = {
          id: leadId,
          firstName: 'Jeff',
          lastName: 'Robertson',
          email: 'jeff@eta-events.com',
          phone: '+1 (555) 123-4567',
          company: 'ETA - Creative Event Producers',
          jobTitle: 'Event Coordinator',
          status: LeadStatus.Contacted,
          source: LeadSource.Website,
          score: 85,
          address: '644 Livingston Court\nMarietta, GA',
          website: 'https://eta-events.com',
          description: 'Event planning company specializing in corporate events and creative productions.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setLead(mockLead);
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast({
          title: "Error",
          description: "Failed to load lead details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    
    try {
      setLead({ ...lead, status: newStatus });
      toast({
        title: "Status Updated",
        description: `Lead status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <div className="text-center">Lead not found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/leads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-bold">
                {lead.company ? lead.company.charAt(0).toUpperCase() : lead.firstName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{lead.company || `${lead.firstName} ${lead.lastName}`}</h1>
              <p className="text-muted-foreground">
                {lead.firstName} {lead.lastName} • {lead.jobTitle}
              </p>
              <div className="mt-2">
                <LeadStatusDropdown 
                  currentStatus={lead.status} 
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel */}
        <div className="space-y-6">
          <AboutSection lead={lead} onUpdate={setLead} />
          <TasksSection leadId={lead.id} />
          <OpportunitiesSection leadId={lead.id} />
          <ContactsSection leadId={lead.id} />
          <CustomFieldsSection leadId={lead.id} />
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="note">Note</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="call">Call</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="note" className="mt-4">
                  <InteractionPanel type="note" leadId={lead.id} />
                </TabsContent>
                <TabsContent value="email" className="mt-4">
                  <InteractionPanel type="email" leadId={lead.id} />
                </TabsContent>
                <TabsContent value="sms" className="mt-4">
                  <InteractionPanel type="sms" leadId={lead.id} />
                </TabsContent>
                <TabsContent value="call" className="mt-4">
                  <InteractionPanel type="call" leadId={lead.id} />
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <InteractionPanel type="activity" leadId={lead.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <ActivityTimeline leadId={lead.id} />
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;