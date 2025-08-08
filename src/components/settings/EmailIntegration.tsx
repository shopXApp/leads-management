import { useState } from 'react';
import { Mail, Calendar, Settings, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEmailCalendar } from '@/hooks/useEmailCalendar';
import { useToast } from '@/hooks/use-toast';

const EmailIntegration = () => {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const { emailAccounts, emailTemplates, addEmailAccount, deleteEmailAccount } = useEmailCalendar();
  const { toast } = useToast();

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    try {
      // This would normally trigger OAuth flow
      await addEmailAccount({
        provider,
        email: `demo.user@${provider === 'gmail' ? 'gmail.com' : 'outlook.com'}`,
        displayName: `Demo ${provider} Account`,
        isActive: emailAccounts.length === 0,
        encryptedTokens: 'encrypted_demo_tokens',
        refreshToken: 'demo_refresh_token',
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      });

      toast({
        title: "Account Connected",
        description: `${provider} account connected successfully`,
      });
      setShowAddAccount(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect email account",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (localId: number) => {
    try {
      await deleteEmailAccount(localId);
      toast({
        title: "Account Disconnected",
        description: "Email account removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove email account",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Accounts</span>
            </div>
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Email Account</DialogTitle>
                  <DialogDescription>
                    Choose an email provider to connect to your CRM
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <Card 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleConnect('gmail')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Mail className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Gmail</h4>
                            <p className="text-sm text-muted-foreground">Connect your Google account</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleConnect('outlook')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Outlook</h4>
                            <p className="text-sm text-muted-foreground">Connect your Microsoft account</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Manage your connected email accounts for sending emails and calendar invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No email accounts connected</p>
              <p className="text-sm">Connect Gmail or Outlook to start sending emails</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailAccounts.map((account) => (
                <div key={account.localId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      account.provider === 'gmail' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Mail className={`h-4 w-4 ${
                        account.provider === 'gmail' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{account.email}</span>
                        {account.isActive && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {account.provider} • {account.displayName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-success border-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => account.localId && handleDisconnect(account.localId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Email Templates</span>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </CardTitle>
          <CardDescription>
            Create reusable email templates with dynamic variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailTemplates.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>No templates created yet</p>
              <p className="text-sm">Create templates to speed up your email workflow</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emailTemplates.map((template) => (
                <div key={template.localId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.subject}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Integration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Calendar Integration</span>
          </CardTitle>
          <CardDescription>
            Send meeting invites and manage calendar events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Calendar Sync</h4>
                <p className="text-sm text-muted-foreground">
                  Sync calendar events with your CRM activities
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Meeting Invites</h4>
                <p className="text-sm text-muted-foreground">
                  Send calendar invites directly from the CRM
                </p>
              </div>
              <Badge variant="secondary">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Services Notice */}
      <Card className="border-warning bg-warning/5">
        <CardHeader>
          <CardTitle className="text-warning">Backend Integration Required</CardTitle>
          <CardDescription>
            To fully enable email and calendar features, backend services are needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h5 className="font-medium">Required Backend Services:</h5>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>OAuth2 proxy for Gmail/Outlook authentication</li>
              <li>Email sending service (SMTP relay)</li>
              <li>Calendar API integration</li>
              <li>Secure token storage and refresh</li>
              <li>CORS handling for API requests</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium">Recommended Implementation:</h5>
            <p className="text-muted-foreground">
              Connect your Lovable project to Supabase for backend functionality, 
              or implement these services in your preferred backend framework.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailIntegration;