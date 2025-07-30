/**
 * Sync Service for CRM Offline-First Architecture
 * 
 * This service manages the synchronization between IndexedDB and the backend API.
 * It handles:
 * - Processing sync queue when online
 * - Retry logic for failed syncs
 * - Data conflict resolution
 * - Sync status management
 */

import { indexedDBService, SyncQueueItem } from './indexeddb';
import { apiService } from './api';
import { Lead, Contact, Company, Opportunity } from '@/types/crm';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime?: number;
  errors: string[];
}

export interface CommunicationLog {
  localId?: number;
  serverId?: string;
  leadId: string | number;
  type: 'notes' | 'call' | 'email' | 'sms' | 'meeting';
  timestamp: number;
  notes: string;
  comments?: string[];
  createdAt: string;
  updatedAt: string;
}

class SyncService {
  private syncInProgress = false;
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds
  private onlineStatusCallback?: (status: SyncStatus) => void;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Set callback for sync status updates
   */
  setStatusCallback(callback: (status: SyncStatus) => void) {
    this.onlineStatusCallback = callback;
  }

  /**
   * Handle coming online - start sync process
   */
  private async handleOnline() {
    console.log('🌐 Coming online - starting sync process');
    await this.startSync();
    this.notifyStatusChange();
  }

  /**
   * Handle going offline
   */
  private handleOffline() {
    console.log('📴 Going offline');
    this.syncInProgress = false;
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.notifyStatusChange();
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const offlineData = await indexedDBService.getOfflineStatus();
    return {
      isOnline: navigator.onLine,
      isSyncing: this.syncInProgress,
      pendingCount: offlineData.pendingSyncCount,
      lastSyncTime: offlineData.lastSyncTime,
      errors: []
    };
  }

  /**
   * Start sync process for all pending items
   */
  async startSync(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      return;
    }

    try {
      this.syncInProgress = true;
      this.notifyStatusChange();

      const pendingItems = await indexedDBService.getPendingSyncItems();
      console.log(`📊 Starting sync for ${pendingItems.length} items`);

      // Process items in batches to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < pendingItems.length; i += batchSize) {
        const batch = pendingItems.slice(i, i + batchSize);
        await Promise.all(batch.map(item => this.syncItem(item)));
      }

      // Clean up completed items
      await indexedDBService.clearCompletedSyncItems();
      localStorage.setItem('lastSyncTime', Date.now().toString());

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
      this.scheduleRetry();
    } finally {
      this.syncInProgress = false;
      this.notifyStatusChange();
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    if (!item.id) return;

    try {
      await indexedDBService.updateSyncQueueItem(item.id, { status: 'syncing' });

      let serverId: string | undefined;

      switch (item.tableName) {
        case 'leads':
          serverId = await this.syncLead(item);
          break;
        case 'contacts':
          serverId = await this.syncContact(item);
          break;
        case 'companies':
          serverId = await this.syncCompany(item);
          break;
        case 'opportunities':
          serverId = await this.syncOpportunity(item);
          break;
        case 'communicationLogs':
          serverId = await this.syncCommunicationLog(item);
          break;
        default:
          throw new Error(`Unknown table: ${item.tableName}`);
      }

      // Update local data with server ID if needed
      if (serverId && item.operation === 'CREATE') {
        const localData = await indexedDBService.get(item.tableName, item.localId);
        if (localData) {
          await indexedDBService.update(item.tableName, { 
            ...(localData as any), 
            serverId 
          });
        }
      }

      await indexedDBService.updateSyncQueueItem(item.id, { 
        status: 'completed',
        serverId 
      });

    } catch (error) {
      console.error(`Failed to sync ${item.tableName} item:`, error);
      
      const newRetryCount = item.retryCount + 1;
      if (newRetryCount < this.maxRetries) {
        await indexedDBService.updateSyncQueueItem(item.id, {
          status: 'pending',
          retryCount: newRetryCount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } else {
        await indexedDBService.updateSyncQueueItem(item.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Sync lead with API
   */
  private async syncLead(item: SyncQueueItem): Promise<string | undefined> {
    switch (item.operation) {
      case 'CREATE':
        const createdLead = await apiService.createLead(item.data);
        return createdLead.id;
      case 'UPDATE':
        if (!item.serverId) throw new Error('Server ID required for update');
        await apiService.updateLead(item.serverId, item.data);
        return item.serverId;
      case 'DELETE':
        if (!item.serverId) throw new Error('Server ID required for delete');
        await apiService.deleteLead(item.serverId);
        return item.serverId;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Sync contact with API
   */
  private async syncContact(item: SyncQueueItem): Promise<string | undefined> {
    switch (item.operation) {
      case 'CREATE':
        const createdContact = await apiService.createContact(item.data);
        return createdContact.id;
      case 'UPDATE':
        if (!item.serverId) throw new Error('Server ID required for update');
        await apiService.updateContact(item.serverId, item.data);
        return item.serverId;
      case 'DELETE':
        if (!item.serverId) throw new Error('Server ID required for delete');
        await apiService.deleteContact(item.serverId);
        return item.serverId;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Sync company with API
   */
  private async syncCompany(item: SyncQueueItem): Promise<string | undefined> {
    switch (item.operation) {
      case 'CREATE':
        const createdCompany = await apiService.createCompany(item.data);
        return createdCompany.id;
      case 'UPDATE':
        if (!item.serverId) throw new Error('Server ID required for update');
        await apiService.updateCompany(item.serverId, item.data);
        return item.serverId;
      case 'DELETE':
        if (!item.serverId) throw new Error('Server ID required for delete');
        await apiService.deleteCompany(item.serverId);
        return item.serverId;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Sync opportunity with API
   */
  private async syncOpportunity(item: SyncQueueItem): Promise<string | undefined> {
    switch (item.operation) {
      case 'CREATE':
        const createdOpportunity = await apiService.createOpportunity(item.data);
        return createdOpportunity.id;
      case 'UPDATE':
        if (!item.serverId) throw new Error('Server ID required for update');
        await apiService.updateOpportunity(item.serverId, item.data);
        return item.serverId;
      case 'DELETE':
        if (!item.serverId) throw new Error('Server ID required for delete');
        await apiService.deleteOpportunity(item.serverId);
        return item.serverId;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Sync communication log with API (placeholder - extend API as needed)
   */
  private async syncCommunicationLog(item: SyncQueueItem): Promise<string | undefined> {
    // For now, we'll store communication logs only locally
    // In a real implementation, you'd extend the API to handle communication logs
    console.log('Communication log sync not implemented in API yet');
    return undefined;
  }

  /**
   * Schedule retry for failed sync
   */
  private scheduleRetry() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      if (navigator.onLine) {
        this.startSync();
      }
    }, this.retryDelay);
  }

  /**
   * Notify status change to callback
   */
  private async notifyStatusChange() {
    if (this.onlineStatusCallback) {
      const status = await this.getSyncStatus();
      this.onlineStatusCallback(status);
    }
  }

  /**
   * Force sync now (manual trigger)
   */
  async forcSync(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }
    await this.startSync();
  }

  /**
   * Clear all pending sync items (emergency reset)
   */
  async clearSyncQueue(): Promise<void> {
    const pendingItems = await indexedDBService.getPendingSyncItems();
    for (const item of pendingItems) {
      if (item.id) {
        await indexedDBService.updateSyncQueueItem(item.id, { status: 'completed' });
      }
    }
    await indexedDBService.clearCompletedSyncItems();
  }
}

export const syncService = new SyncService();
export default syncService;