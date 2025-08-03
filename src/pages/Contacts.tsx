import { useState } from 'react';
import { Plus, Search, Filter, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Contact, Company } from '@/types/crm';
import { apiService } from '@/services/api';
import { useOfflineFirst } from '@/hooks/useOfflineFirst';
import SyncStatus from '@/components/ui/sync-status';
import { AddContactDialog } from '@/components/forms/AddContactDialog';
import { EditContactDialog } from '@/components/forms/EditContactDialog';
import { useToast } from '@/hooks/use-toast';

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { 
    data: contacts, 
    loading, 
    syncStatus, 
    error,
    actions 
  } = useOfflineFirst<Contact>({
    tableName: 'contacts',
    apiMethods: {
      getAll: (params) => apiService.getContacts(params),
      create: (data) => apiService.createContact(data),
      update: (id, data) => apiService.updateContact(id, data),
      delete: (id) => apiService.deleteContact(id)
    }
  });

  // Get companies for the contact dialogs
  const { 
    data: companies
  } = useOfflineFirst<Company>({
    tableName: 'companies',
    apiMethods: {
      getAll: (params) => apiService.getCompanies(params),
      create: (data) => apiService.createCompany(data),
      update: (id, data) => apiService.updateCompany(id, data),
      delete: (id) => apiService.deleteCompany(id)
    }
  });

  const handleSearch = () => {
    // In a more advanced implementation, you could filter locally first
    // then sync with search parameters
    actions.refresh();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleAddContact = async (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await actions.create(data);
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setEditDialogOpen(true);
  };

  const handleSaveContact = async (data: Partial<Contact>) => {
    try {
      await actions.update((data.localId || data.id!) as number, data);
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      try {
        await actions.delete((contact.localId || contact.id!) as number);
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete contact",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <SyncStatus showDetails={false} />
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={actions.refresh}
            disabled={loading || !syncStatus.isOnline}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <AddContactDialog 
            onAdd={handleAddContact} 
            companies={companies.filter(c => c.id || c.localId).map(c => ({ 
              id: (c.id || c.localId!.toString()), 
              name: c.name 
            }))} 
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <Filter className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts</CardTitle>
          <CardDescription>
            Manage your contact database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No contacts found</TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                   <TableRow key={contact.localId || contact.id}>
                     <TableCell className="flex items-center space-x-3">
                       <Avatar className="h-8 w-8">
                         <AvatarFallback>
                           {getInitials(contact.firstName, contact.lastName)}
                         </AvatarFallback>
                       </Avatar>
                       <div>
                         <div className="font-medium">
                           {contact.firstName} {contact.lastName}
                         </div>
                         {!contact.serverId && (
                           <div className="text-xs text-muted-foreground">Local only</div>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone || '-'}</TableCell>
                      <TableCell>{contact.jobTitle || '-'}</TableCell>
                      <TableCell>{contact.company?.name || '-'}</TableCell>
                      <TableCell>{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContact(contact)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                   </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditContactDialog
        contact={editingContact}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveContact}
        companies={companies.filter(c => c.id || c.localId).map(c => ({ 
          id: (c.id || c.localId!.toString()), 
          name: c.name 
        }))}
      />
    </div>
  );
};

export default Contacts;