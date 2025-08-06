import { useState } from 'react';
import { Send, Phone, PhoneCall, Save, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface InteractionPanelProps {
  type: 'note' | 'email' | 'sms' | 'call' | 'activity';
  leadId: string;
}

export const InteractionPanel = ({ type, leadId }: InteractionPanelProps) => {
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callInterval, setCallInterval] = useState<NodeJS.Timeout | null>(null);

  const contacts = [
    { id: '1', name: 'Jeff Robertson', email: 'jeff@eta-events.com', phone: '+1 (555) 123-4567' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@eta-events.com', phone: '+1 (555) 123-4568' }
  ];

  const handleSave = () => {
    if (!content.trim() && type !== 'call') return;
    
    const actionMap = {
      note: 'Note added',
      email: 'Email sent',
      sms: 'SMS sent',
      call: 'Call logged',
      activity: 'Activity logged'
    };

    toast({
      title: "Success",
      description: actionMap[type],
    });

    setContent('');
    setSubject('');
    setSelectedContact('');
  };

  const startCall = () => {
    setIsRecording(true);
    setCallDuration(0);
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    setCallInterval(interval);
  };

  const stopCall = () => {
    setIsRecording(false);
    if (callInterval) {
      clearInterval(callInterval);
      setCallInterval(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (type) {
      case 'note':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Add your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSave} disabled={!content.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Select Contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Email message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSave} disabled={!selectedContact || !subject.trim() || !content.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Select Contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="SMS message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                maxLength={160}
              />
              <div className="text-xs text-muted-foreground text-right">
                {content.length}/160
              </div>
            </div>
            <Button onClick={handleSave} disabled={!selectedContact || !content.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
          </div>
        );

      case 'call':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Select Contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Card className="p-4 bg-muted/50">
              <div className="text-center space-y-4">
                <div className="text-2xl font-mono">{formatDuration(callDuration)}</div>
                <div className="flex justify-center space-x-2">
                  {!isRecording ? (
                    <Button onClick={startCall} disabled={!selectedContact}>
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Start Call
                    </Button>
                  ) : (
                    <Button onClick={stopCall} variant="destructive">
                      <Square className="h-4 w-4 mr-2" />
                      End Call
                    </Button>
                  )}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Recording...</span>
                  </div>
                )}
              </div>
            </Card>

            {callDuration > 0 && (
              <div className="space-y-2">
                <Label htmlFor="summary">Call Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Add call summary and notes..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <Button onClick={handleSave} disabled={!selectedContact || callDuration === 0}>
              <Save className="h-4 w-4 mr-2" />
              Save Call Log
            </Button>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity">Activity Description</Label>
              <Textarea
                id="activity"
                placeholder="Describe the activity..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleSave} disabled={!content.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return <div>{renderContent()}</div>;
};