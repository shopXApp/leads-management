import { useState } from 'react';
import { Send, Paperclip, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEmailCalendar } from '@/hooks/useEmailCalendar';
import { useToast } from '@/hooks/use-toast';

interface EmailComposerProps {
  onClose?: () => void;
  defaultRecipients?: string[];
  defaultSubject?: string;
}

const EmailComposer = ({ onClose, defaultRecipients = [], defaultSubject = '' }: EmailComposerProps) => {
  const [to, setTo] = useState(defaultRecipients.join(', '));
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [sending, setSending] = useState(false);
  
  const { emailAccounts, emailTemplates, addToEmailQueue } = useEmailCalendar();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please provide recipient, subject, and select an email account",
        variant: "destructive",
      });
      return;
    }

    const selectedAccountData = emailAccounts.find(acc => acc.localId?.toString() === selectedAccount);
    if (!selectedAccountData?.localId) {
      toast({
        title: "Invalid Account",
        description: "Please select a valid email account",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Convert File objects to EmailAttachment format
      const emailAttachments = await Promise.all(
        attachments.map(async (file) => ({
          name: file.name,
          mimeType: file.type,
          size: file.size,
          data: await fileToBase64(file)
        }))
      );

      await addToEmailQueue({
        fromEmailAccountId: selectedAccountData.localId,
        to: to.split(',').map(email => email.trim()),
        cc: cc ? cc.split(',').map(email => email.trim()) : [],
        bcc: bcc ? bcc.split(',').map(email => email.trim()) : [],
        subject,
        htmlContent: body.replace(/\n/g, '<br>'),
        textContent: body,
        attachments: emailAttachments,
        priority: 'normal' as const,
        maxRetries: 3
      });

      toast({
        title: "Email Queued",
        description: "Email has been queued for sending",
      });

      // Reset form
      setTo('');
      setCc('');
      setBcc('');
      setSubject('');
      setBody('');
      setAttachments([]);
      setSelectedAccount('');
      onClose?.();
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to queue email for sending",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:mime;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const applyTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.localId?.toString() === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.htmlContent.replace(/<br>/g, '\n').replace(/<[^>]*>/g, ''));
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Compose Email</CardTitle>
        <div className="flex items-center space-x-2">
          {emailTemplates.length > 0 && (
            <Select value={selectedTemplate} onValueChange={(value) => {
              setSelectedTemplate(value);
              if (value) applyTemplate(value);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.localId} value={template.localId?.toString() || ''}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From Field */}
        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger>
              <SelectValue placeholder="Select email account" />
            </SelectTrigger>
            <SelectContent>
              {emailAccounts.map((account) => (
                <SelectItem key={account.localId} value={account.localId?.toString() || ''}>
                  {account.email} ({account.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To Field */}
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCC(!showCC)}
            >
              CC
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBCC(!showBCC)}
            >
              BCC
            </Button>
          </div>
        </div>

        {/* CC Field */}
        {showCC && (
          <div className="space-y-2">
            <Label htmlFor="cc">CC</Label>
            <Input
              id="cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
            />
          </div>
        )}

        {/* BCC Field */}
        {showBCC && (
          <div className="space-y-2">
            <Label htmlFor="bcc">BCC</Label>
            <Input
              id="bcc"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@example.com"
            />
          </div>
        )}

        {/* Subject Field */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>

        {/* Body Field */}
        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-48"
          />
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <Label>Attachments</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Attach Files
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Send
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Email</DialogTitle>
                  <DialogDescription>
                    Choose when to send this email
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="send-date">Send Date</Label>
                    <Input id="send-date" type="datetime-local" />
                  </div>
                  <Button className="w-full">Schedule Email</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || emailAccounts.length === 0}>
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>

        {emailAccounts.length === 0 && (
          <div className="text-center py-4 text-warning bg-warning/10 rounded-lg">
            <p className="text-sm">No email accounts connected. Please add an email account in Settings to send emails.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailComposer;