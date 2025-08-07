/**
 * IndexedDB Service for CRM Offline Support
 * 
 * This service manages the local IndexedDB database "CRM_DB" with object stores for:
 * - Leads: Auto-incrementing ID, indexes on status, source, email
 * - Contacts: Auto-incrementing ID, indexes on email, companyId
 * - Companies: Auto-incrementing ID, indexes on name, industry
 * - Opportunities: Auto-incrementing ID, indexes on stage, assignedTo
 * - CommunicationLogs: Auto-incrementing ID, indexes on leadId, type, timestamp
 * - SyncQueue: Stores pending operations for backend sync
 */

export interface SyncQueueItem {
  id?: number;
  tableName: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  localId: string | number;
  data?: any;
  serverId?: string;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
}

export interface OfflineData {
  isOffline: boolean;
  lastSyncTime?: number;
  pendingSyncCount: number;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'CRM_DB';
  private readonly dbVersion = 1;

  /**
   * Initialize IndexedDB with all required object stores and indexes
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Leads store
        if (!db.objectStoreNames.contains('leads')) {
          const leadsStore = db.createObjectStore('leads', { keyPath: 'localId', autoIncrement: true });
          leadsStore.createIndex('status', 'status', { unique: false });
          leadsStore.createIndex('source', 'source', { unique: false });
          leadsStore.createIndex('email', 'email', { unique: false });
          leadsStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Contacts store
        if (!db.objectStoreNames.contains('contacts')) {
          const contactsStore = db.createObjectStore('contacts', { keyPath: 'localId', autoIncrement: true });
          contactsStore.createIndex('email', 'email', { unique: false });
          contactsStore.createIndex('companyId', 'companyId', { unique: false });
          contactsStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Companies store
        if (!db.objectStoreNames.contains('companies')) {
          const companiesStore = db.createObjectStore('companies', { keyPath: 'localId', autoIncrement: true });
          companiesStore.createIndex('name', 'name', { unique: false });
          companiesStore.createIndex('industry', 'industry', { unique: false });
          companiesStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Opportunities store
        if (!db.objectStoreNames.contains('opportunities')) {
          const opportunitiesStore = db.createObjectStore('opportunities', { keyPath: 'localId', autoIncrement: true });
          opportunitiesStore.createIndex('stage', 'stage', { unique: false });
          opportunitiesStore.createIndex('assignedTo', 'assignedTo', { unique: false });
          opportunitiesStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Communication Logs store
        if (!db.objectStoreNames.contains('communicationLogs')) {
          const logsStore = db.createObjectStore('communicationLogs', { keyPath: 'localId', autoIncrement: true });
          logsStore.createIndex('leadId', 'leadId', { unique: false });
          logsStore.createIndex('type', 'type', { unique: false });
          logsStore.createIndex('timestamp', 'timestamp', { unique: false });
          logsStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Sync Queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('tableName', 'tableName', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Email Accounts store
        if (!db.objectStoreNames.contains('emailAccounts')) {
          const emailAccountsStore = db.createObjectStore('emailAccounts', { keyPath: 'localId', autoIncrement: true });
          emailAccountsStore.createIndex('provider', 'provider', { unique: false });
          emailAccountsStore.createIndex('email', 'email', { unique: false });
          emailAccountsStore.createIndex('isActive', 'isActive', { unique: false });
          emailAccountsStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Email Templates store
        if (!db.objectStoreNames.contains('emailTemplates')) {
          const emailTemplatesStore = db.createObjectStore('emailTemplates', { keyPath: 'localId', autoIncrement: true });
          emailTemplatesStore.createIndex('name', 'name', { unique: false });
          emailTemplatesStore.createIndex('category', 'category', { unique: false });
          emailTemplatesStore.createIndex('isActive', 'isActive', { unique: false });
          emailTemplatesStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Email Queue store
        if (!db.objectStoreNames.contains('emailQueue')) {
          const emailQueueStore = db.createObjectStore('emailQueue', { keyPath: 'localId', autoIncrement: true });
          emailQueueStore.createIndex('status', 'status', { unique: false });
          emailQueueStore.createIndex('priority', 'priority', { unique: false });
          emailQueueStore.createIndex('scheduledSendTime', 'scheduledSendTime', { unique: false });
          emailQueueStore.createIndex('fromEmailAccountId', 'fromEmailAccountId', { unique: false });
          emailQueueStore.createIndex('leadId', 'leadId', { unique: false });
          emailQueueStore.createIndex('contactId', 'contactId', { unique: false });
          emailQueueStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Calendar Events store
        if (!db.objectStoreNames.contains('calendarEvents')) {
          const calendarEventsStore = db.createObjectStore('calendarEvents', { keyPath: 'localId', autoIncrement: true });
          calendarEventsStore.createIndex('startTime', 'startTime', { unique: false });
          calendarEventsStore.createIndex('endTime', 'endTime', { unique: false });
          calendarEventsStore.createIndex('status', 'status', { unique: false });
          calendarEventsStore.createIndex('emailAccountId', 'emailAccountId', { unique: false });
          calendarEventsStore.createIndex('leadId', 'leadId', { unique: false });
          calendarEventsStore.createIndex('contactId', 'contactId', { unique: false });
          calendarEventsStore.createIndex('serverId', 'serverId', { unique: true });
        }

        // Email Sent History store
        if (!db.objectStoreNames.contains('emailSentHistory')) {
          const emailSentHistoryStore = db.createObjectStore('emailSentHistory', { keyPath: 'localId', autoIncrement: true });
          emailSentHistoryStore.createIndex('emailQueueId', 'emailQueueId', { unique: false });
          emailSentHistoryStore.createIndex('messageId', 'messageId', { unique: false });
          emailSentHistoryStore.createIndex('sentAt', 'sentAt', { unique: false });
          emailSentHistoryStore.createIndex('deliveryStatus', 'deliveryStatus', { unique: false });
          emailSentHistoryStore.createIndex('leadId', 'leadId', { unique: false });
          emailSentHistoryStore.createIndex('contactId', 'contactId', { unique: false });
          emailSentHistoryStore.createIndex('serverId', 'serverId', { unique: true });
        }
      };
    });
  }

  /**
   * Generic method to add data to any store
   */
  async add<T>(storeName: string, data: T): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to update data in any store
   */
  async update<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to get data by key from any store
   */
  async get<T>(storeName: string, key: string | number): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to get all data from any store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to delete data from any store
   */
  async delete(storeName: string, key: string | number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data by index
   */
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<number> {
    const queueItem: SyncQueueItem = {
      ...item,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };
    return this.add('syncQueue', queueItem);
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update sync queue item status
   */
  async updateSyncQueueItem(id: number, updates: Partial<SyncQueueItem>): Promise<void> {
    const item = await this.get<SyncQueueItem>('syncQueue', id);
    if (item) {
      await this.update('syncQueue', { ...item, ...updates });
    }
  }

  /**
   * Clear completed sync items
   */
  async clearCompletedSyncItems(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const index = store.index('status');
      const request = index.openCursor(IDBKeyRange.only('completed'));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get offline data status
   */
  async getOfflineStatus(): Promise<OfflineData> {
    const pendingItems = await this.getPendingSyncItems();
    return {
      isOffline: !navigator.onLine,
      pendingSyncCount: pendingItems.length,
      lastSyncTime: localStorage.getItem('lastSyncTime') ? 
        parseInt(localStorage.getItem('lastSyncTime')!) : undefined
    };
  }

  /**
   * Email & Calendar specific methods
   */

  // Email Queue methods
  async addToEmailQueue(emailData: any): Promise<number> {
    const queueItem = {
      ...emailData,
      status: 'queued',
      retryCount: 0,
      maxRetries: 3,
      priority: emailData.priority || 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return this.add('emailQueue', queueItem);
  }

  async getQueuedEmails(): Promise<any[]> {
    return this.getByIndex('emailQueue', 'status', 'queued');
  }

  async updateEmailQueueStatus(localId: number, status: string, error?: string): Promise<void> {
    const item = await this.get<any>('emailQueue', localId);
    if (item) {
      const updates: any = {
        ...item,
        status,
        lastAttempt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (error) {
        updates.error = error;
        updates.retryCount = (item.retryCount || 0) + 1;
      }
      if (status === 'sent') {
        updates.sentAt = new Date().toISOString();
      }
      await this.update('emailQueue', updates);
    }
  }

  // Calendar methods
  async getUpcomingEvents(startDate: string, endDate: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['calendarEvents'], 'readonly');
      const store = transaction.objectStore('calendarEvents');
      const index = store.index('startTime');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getEventsByEntity(entityType: 'lead' | 'contact' | 'opportunity', entityId: string): Promise<any[]> {
    const indexName = `${entityType}Id`;
    return this.getByIndex('calendarEvents', indexName, entityId);
  }

  // Email account methods
  async getActiveEmailAccounts(): Promise<any[]> {
    return this.getByIndex('emailAccounts', 'isActive', true);
  }

  async getEmailAccountByProvider(provider: string): Promise<any[]> {
    return this.getByIndex('emailAccounts', 'provider', provider);
  }

  // Email template methods
  async getActiveEmailTemplates(): Promise<any[]> {
    return this.getByIndex('emailTemplates', 'isActive', true);
  }

  async getEmailTemplatesByCategory(category: string): Promise<any[]> {
    return this.getByIndex('emailTemplates', 'category', category);
  }

  // Email history methods
  async getEmailHistoryByEntity(entityType: 'lead' | 'contact' | 'opportunity', entityId: string): Promise<any[]> {
    const indexName = `${entityType}Id`;
    return this.getByIndex('emailSentHistory', indexName, entityId);
  }

  async getEmailHistoryByDate(startDate: string, endDate: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['emailSentHistory'], 'readonly');
      const store = transaction.objectStore('emailSentHistory');
      const index = store.index('sentAt');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
export default indexedDBService;