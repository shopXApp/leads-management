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
}

export const indexedDBService = new IndexedDBService();
export default indexedDBService;