/**
 * Custom Hook for Offline-First Data Management
 * 
 * This hook provides:
 * - CRUD operations that work offline-first
 * - Automatic sync when online
 * - Loading states and sync status
 * - Error handling for offline scenarios
 */

import { useState, useEffect, useCallback } from 'react';
import { indexedDBService } from '@/services/indexeddb';
import { syncService, SyncStatus } from '@/services/syncService';
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface OfflineFirstOptions {
  tableName: string;
  apiMethods: {
    getAll: (params?: any) => Promise<{ data: any[] }>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<void>;
  };
}

export interface OfflineFirstState<T> {
  data: T[];
  loading: boolean;
  syncStatus: SyncStatus;
  error: string | null;
}

export function useOfflineFirst<T extends { localId?: number; serverId?: string; id?: string }>(
  options: OfflineFirstOptions
) {
  const [state, setState] = useState<OfflineFirstState<T>>({
    data: [],
    loading: true,
    syncStatus: {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingCount: 0,
      errors: []
    },
    error: null
  });

  /**
   * Initialize IndexedDB and load data
   */
  useEffect(() => {
    const initializeData = async () => {
      try {
        await indexedDBService.init();
        await loadData();
        
        // Set up sync status callback
        syncService.setStatusCallback((status) => {
          setState(prev => ({ ...prev, syncStatus: status }));
        });

        // Initial sync status
        const status = await syncService.getSyncStatus();
        setState(prev => ({ ...prev, syncStatus: status }));

        // Try to sync on initialization if online
        if (navigator.onLine) {
          syncService.startSync();
        }
      } catch (error) {
        console.error('Failed to initialize offline-first data:', error);
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Initialization failed',
          loading: false 
        }));
      }
    };

    initializeData();
  }, [options.tableName]);

  /**
   * Load data from IndexedDB first, then sync with API if online
   */
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // First, load from IndexedDB for instant display
      const localData = await indexedDBService.getAll<T>(options.tableName);
      setState(prev => ({ ...prev, data: localData, loading: false }));

      // Then, if online, fetch fresh data from API and update IndexedDB
      if (navigator.onLine) {
        try {
          const apiResponse = await options.apiMethods.getAll();
          const apiData = apiResponse.data;

          // Clear and repopulate IndexedDB with fresh API data
          // Note: In a real implementation, you'd want smarter merge logic
          // to preserve pending local changes
          for (const item of apiData) {
            const localItem = { ...item, serverId: item.id, localId: undefined };
            await indexedDBService.add(options.tableName, localItem);
          }

          // Reload from IndexedDB to get consistent data structure
          const refreshedData = await indexedDBService.getAll<T>(options.tableName);
          setState(prev => ({ ...prev, data: refreshedData }));
        } catch (apiError) {
          console.warn('API fetch failed, using cached data:', apiError);
          // Continue with local data
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false 
      }));
    }
  }, [options.tableName, options.apiMethods]);

  /**
   * Create new item (offline-first)
   */
  const create = useCallback(async (data: Partial<T>): Promise<void> => {
    try {
      // Add to IndexedDB immediately
      const localData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const localId = await indexedDBService.add(options.tableName, localData);

      // Add to sync queue
      await indexedDBService.addToSyncQueue({
        tableName: options.tableName,
        operation: 'CREATE',
        localId,
        data: localData
      });

      // Refresh local data
      await loadData();

      // Show feedback
      if (navigator.onLine) {
        toast({
          title: "Created successfully",
          description: "Item created and will sync with server"
        });
        // Trigger sync
        syncService.startSync();
      } else {
        toast({
          title: "Saved offline",
          description: "Item saved locally and will sync when you're back online"
        });
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  }, [options.tableName, options.apiMethods, loadData]);

  /**
   * Update existing item (offline-first)
   */
  const update = useCallback(async (localId: number, data: Partial<T>): Promise<void> => {
    try {
      // Get existing item
      const existingItem = await indexedDBService.get<T>(options.tableName, localId);
      if (!existingItem) {
        throw new Error('Item not found');
      }

      // Update in IndexedDB
      const updatedData = {
        ...existingItem,
        ...data,
        updatedAt: new Date().toISOString()
      };

      await indexedDBService.update(options.tableName, updatedData);

      // Add to sync queue
      await indexedDBService.addToSyncQueue({
        tableName: options.tableName,
        operation: 'UPDATE',
        localId,
        data: updatedData,
        serverId: existingItem.serverId
      });

      // Refresh local data
      await loadData();

      // Show feedback
      if (navigator.onLine) {
        toast({
          title: "Updated successfully",
          description: "Item updated and will sync with server"
        });
        syncService.startSync();
      } else {
        toast({
          title: "Updated offline",
          description: "Item updated locally and will sync when you're back online"
        });
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  }, [options.tableName, options.apiMethods, loadData]);

  /**
   * Delete item (offline-first)
   */
  const deleteItem = useCallback(async (localId: number): Promise<void> => {
    try {
      // Get existing item to check if it has a server ID
      const existingItem = await indexedDBService.get<T>(options.tableName, localId);
      if (!existingItem) {
        throw new Error('Item not found');
      }

      // Delete from IndexedDB
      await indexedDBService.delete(options.tableName, localId);

      // If item exists on server, add to sync queue
      if (existingItem.serverId) {
        await indexedDBService.addToSyncQueue({
          tableName: options.tableName,
          operation: 'DELETE',
          localId,
          serverId: existingItem.serverId
        });
      }

      // Refresh local data
      await loadData();

      // Show feedback
      if (navigator.onLine && existingItem.serverId) {
        toast({
          title: "Deleted successfully",
          description: "Item deleted and will sync with server"
        });
        syncService.startSync();
      } else {
        toast({
          title: "Deleted",
          description: existingItem.serverId ? 
            "Item deleted locally and will sync when you're back online" :
            "Item deleted"
        });
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  }, [options.tableName, options.apiMethods, loadData]);

  /**
   * Force refresh data from API
   */
  const refresh = useCallback(async () => {
    if (!navigator.onLine) {
      toast({
        title: "Cannot refresh",
        description: "You're offline. Showing cached data.",
        variant: "destructive"
      });
      return;
    }
    await loadData();
  }, [loadData]);

  /**
   * Manual sync trigger
   */
  const forceSync = useCallback(async () => {
    try {
      await syncService.forcSync();
      toast({
        title: "Sync completed",
        description: "All pending changes have been synced"
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  }, []);

  return {
    ...state,
    actions: {
      create,
      update,
      delete: deleteItem,
      refresh,
      forceSync
    }
  };
}