import { useState, useEffect, useCallback } from 'react';
import { indexedDBService } from '@/services/indexeddb';
import { EmailAccount, EmailTemplate, EmailQueueItem, CalendarEvent, EmailSentHistory } from '@/types/crm';

export interface UseEmailCalendarReturn {
  // Email Accounts
  emailAccounts: EmailAccount[];
  activeEmailAccount: EmailAccount | null;
  setActiveEmailAccount: (account: EmailAccount | null) => void;
  addEmailAccount: (account: Omit<EmailAccount, 'id' | 'localId' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateEmailAccount: (account: EmailAccount) => Promise<void>;
  deleteEmailAccount: (localId: number) => Promise<void>;

  // Email Templates
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'localId' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateEmailTemplate: (template: EmailTemplate) => Promise<void>;
  deleteEmailTemplate: (localId: number) => Promise<void>;

  // Email Queue
  emailQueue: EmailQueueItem[];
  queuedEmails: EmailQueueItem[];
  addToEmailQueue: (email: Omit<EmailQueueItem, 'id' | 'localId' | 'status' | 'retryCount' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateEmailQueueStatus: (localId: number, status: string, error?: string) => Promise<void>;
  getQueuedEmails: () => Promise<EmailQueueItem[]>;

  // Calendar Events
  calendarEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'localId' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  updateCalendarEvent: (event: CalendarEvent) => Promise<void>;
  deleteCalendarEvent: (localId: number) => Promise<void>;
  getEventsByEntity: (entityType: 'lead' | 'contact' | 'opportunity', entityId: string) => Promise<CalendarEvent[]>;

  // Email History
  emailHistory: EmailSentHistory[];
  getEmailHistoryByEntity: (entityType: 'lead' | 'contact' | 'opportunity', entityId: string) => Promise<EmailSentHistory[]>;
  getEmailHistoryByDate: (startDate: string, endDate: string) => Promise<EmailSentHistory[]>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Utility functions
  refreshData: () => Promise<void>;
  initializeDatabase: () => Promise<void>;
}

export const useEmailCalendar = (): UseEmailCalendarReturn => {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [activeEmailAccount, setActiveEmailAccount] = useState<EmailAccount | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
  const [queuedEmails, setQueuedEmails] = useState<EmailQueueItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailSentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load initial data
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await indexedDBService.init();
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh all data from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      
      // Load email accounts
      const accounts = await indexedDBService.getAll<EmailAccount>('emailAccounts');
      setEmailAccounts(accounts);
      
      // Set active account (first active one or first one)
      const activeAccount = accounts.find(acc => acc.isActive) || accounts[0] || null;
      setActiveEmailAccount(activeAccount);

      // Load email templates
      const templates = await indexedDBService.getActiveEmailTemplates();
      setEmailTemplates(templates);

      // Load email queue
      const queue = await indexedDBService.getAll<EmailQueueItem>('emailQueue');
      setEmailQueue(queue);
      
      // Load queued emails specifically
      const queued = await indexedDBService.getQueuedEmails();
      setQueuedEmails(queued);

      // Load calendar events
      const events = await indexedDBService.getAll<CalendarEvent>('calendarEvents');
      setCalendarEvents(events);

      // Load upcoming events (next 30 days)
      const today = new Date().toISOString();
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const upcoming = await indexedDBService.getUpcomingEvents(today, futureDate);
      setUpcomingEvents(upcoming);

      // Load email history
      const history = await indexedDBService.getAll<EmailSentHistory>('emailSentHistory');
      setEmailHistory(history);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }, []);

  // Email Account methods
  const addEmailAccount = useCallback(async (accountData: Omit<EmailAccount, 'id' | 'localId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const account = {
        ...accountData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const localId = await indexedDBService.add('emailAccounts', account);
      await refreshData();
      return localId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add email account');
      throw err;
    }
  }, [refreshData]);

  const updateEmailAccount = useCallback(async (account: EmailAccount) => {
    try {
      await indexedDBService.update('emailAccounts', {
        ...account,
        updatedAt: new Date().toISOString()
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email account');
      throw err;
    }
  }, [refreshData]);

  const deleteEmailAccount = useCallback(async (localId: number) => {
    try {
      await indexedDBService.delete('emailAccounts', localId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete email account');
      throw err;
    }
  }, [refreshData]);

  // Email Template methods
  const addEmailTemplate = useCallback(async (templateData: Omit<EmailTemplate, 'id' | 'localId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const template = {
        ...templateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const localId = await indexedDBService.add('emailTemplates', template);
      await refreshData();
      return localId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add email template');
      throw err;
    }
  }, [refreshData]);

  const updateEmailTemplate = useCallback(async (template: EmailTemplate) => {
    try {
      await indexedDBService.update('emailTemplates', {
        ...template,
        updatedAt: new Date().toISOString()
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email template');
      throw err;
    }
  }, [refreshData]);

  const deleteEmailTemplate = useCallback(async (localId: number) => {
    try {
      await indexedDBService.delete('emailTemplates', localId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete email template');
      throw err;
    }
  }, [refreshData]);

  // Email Queue methods
  const addToEmailQueue = useCallback(async (emailData: Omit<EmailQueueItem, 'id' | 'localId' | 'status' | 'retryCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const localId = await indexedDBService.addToEmailQueue(emailData);
      await refreshData();
      return localId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add email to queue');
      throw err;
    }
  }, [refreshData]);

  const updateEmailQueueStatus = useCallback(async (localId: number, status: string, error?: string) => {
    try {
      await indexedDBService.updateEmailQueueStatus(localId, status, error);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email queue status');
      throw err;
    }
  }, [refreshData]);

  const getQueuedEmails = useCallback(async () => {
    try {
      return await indexedDBService.getQueuedEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get queued emails');
      throw err;
    }
  }, []);

  // Calendar Event methods
  const addCalendarEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'localId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const event = {
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const localId = await indexedDBService.add('calendarEvents', event);
      await refreshData();
      return localId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add calendar event');
      throw err;
    }
  }, [refreshData]);

  const updateCalendarEvent = useCallback(async (event: CalendarEvent) => {
    try {
      await indexedDBService.update('calendarEvents', {
        ...event,
        updatedAt: new Date().toISOString()
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update calendar event');
      throw err;
    }
  }, [refreshData]);

  const deleteCalendarEvent = useCallback(async (localId: number) => {
    try {
      await indexedDBService.delete('calendarEvents', localId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete calendar event');
      throw err;
    }
  }, [refreshData]);

  const getEventsByEntity = useCallback(async (entityType: 'lead' | 'contact' | 'opportunity', entityId: string) => {
    try {
      return await indexedDBService.getEventsByEntity(entityType, entityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get events by entity');
      throw err;
    }
  }, []);

  // Email History methods
  const getEmailHistoryByEntity = useCallback(async (entityType: 'lead' | 'contact' | 'opportunity', entityId: string) => {
    try {
      return await indexedDBService.getEmailHistoryByEntity(entityType, entityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get email history by entity');
      throw err;
    }
  }, []);

  const getEmailHistoryByDate = useCallback(async (startDate: string, endDate: string) => {
    try {
      return await indexedDBService.getEmailHistoryByDate(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get email history by date');
      throw err;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  return {
    // Email Accounts
    emailAccounts,
    activeEmailAccount,
    setActiveEmailAccount,
    addEmailAccount,
    updateEmailAccount,
    deleteEmailAccount,

    // Email Templates
    emailTemplates,
    addEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,

    // Email Queue
    emailQueue,
    queuedEmails,
    addToEmailQueue,
    updateEmailQueueStatus,
    getQueuedEmails,

    // Calendar Events
    calendarEvents,
    upcomingEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getEventsByEntity,

    // Email History
    emailHistory,
    getEmailHistoryByEntity,
    getEmailHistoryByDate,

    // Loading states
    isLoading,
    error,

    // Utility functions
    refreshData,
    initializeDatabase
  };
};