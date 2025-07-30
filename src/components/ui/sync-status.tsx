/**
 * Sync Status Component
 * 
 * Displays the current sync status in the UI with visual indicators for:
 * - Online/offline status
 * - Pending sync count
 * - Sync in progress
 * - Last sync time
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { syncService, SyncStatus } from '@/services/syncService';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function SyncStatusIndicator({ className, showDetails = false }: SyncStatusProps) {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    errors: []
  });

  useEffect(() => {
    // Set up sync status callback
    syncService.setStatusCallback(setStatus);
    
    // Get initial status
    const loadInitialStatus = async () => {
      const initialStatus = await syncService.getSyncStatus();
      setStatus(initialStatus);
    };
    
    loadInitialStatus();

    // Listen for online/offline events
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForceSync = async () => {
    try {
      await syncService.forcSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (status.pendingCount > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (status.isSyncing) return 'Syncing...';
    if (!status.isOnline) return 'Offline';
    if (status.pendingCount > 0) return `${status.pendingCount} pending`;
    return 'Synced';
  };

  const getLastSyncText = () => {
    if (!status.lastSyncTime) return 'Never synced';
    
    const diff = Date.now() - status.lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center space-x-2", className)}>
              {getStatusIcon()}
              {status.pendingCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {status.pendingCount}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div>{getStatusText()}</div>
              <div className="text-muted-foreground">Last sync: {getLastSyncText()}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3 p-3 bg-muted/50 rounded-lg", className)}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {status.pendingCount > 0 && (
        <Badge variant="outline">
          {status.pendingCount} pending
        </Badge>
      )}
      
      <div className="flex-1" />
      
      <div className="text-xs text-muted-foreground">
        Last sync: {getLastSyncText()}
      </div>
      
      {status.isOnline && status.pendingCount > 0 && !status.isSyncing && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleForceSync}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
}

export default SyncStatusIndicator;