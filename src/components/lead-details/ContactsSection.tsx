import { useState } from 'react';
import { Plus, Users, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddContactDialog } from '@/components/lead-details/AddContactDialog';

interface Contact {
  id: string;
  name: string;
  email: string;
  mobile: string;
  jobTitle?: string;
  createdAt: string;
}

interface ContactsSectionProps {
  leadId: string;
}

export const ContactsSection = ({ leadId }: ContactsSectionProps) => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Jeff Robertson',
      email: 'jeff@eta-events.com',
      mobile: '+1 (555) 123-4567',
      jobTitle: 'Event Coordinator',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@eta-events.com',
      mobile: '+1 (555) 123-4568',
      jobTitle: 'Creative Director',
      createdAt: new Date().toISOString(),
    }
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setContacts([...contacts, newContact]);
    setShowAddDialog(false);
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Contacts ({contacts.length})
        </CardTitle>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <AddContactDialog onAdd={handleAddContact} onCancel={() => setShowAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts yet</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex-1 space-y-1">
                <div className="font-medium">{contact.name}</div>
                {contact.jobTitle && (
                  <div className="text-xs text-muted-foreground">{contact.jobTitle}</div>
                )}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{contact.mobile}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteContact(contact.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};