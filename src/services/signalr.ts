import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { RealtimeUpdate } from '@/types/crm';

class SignalRService {
  private connection: HubConnection | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7000/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.startConnection();
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Generic real-time update handler
    this.connection.on('RealtimeUpdate', (update: RealtimeUpdate) => {
      console.log('Received real-time update:', update);
      this.notifyListeners('RealtimeUpdate', update);
    });

    // Lead updates
    this.connection.on('LeadUpdated', (leadData: any) => {
      console.log('Lead updated:', leadData);
      this.notifyListeners('LeadUpdated', leadData);
    });

    // Contact updates
    this.connection.on('ContactUpdated', (contactData: any) => {
      console.log('Contact updated:', contactData);
      this.notifyListeners('ContactUpdated', contactData);
    });

    // Opportunity updates
    this.connection.on('OpportunityUpdated', (opportunityData: any) => {
      console.log('Opportunity updated:', opportunityData);
      this.notifyListeners('OpportunityUpdated', opportunityData);
    });

    // Activity updates
    this.connection.on('ActivityCreated', (activityData: any) => {
      console.log('Activity created:', activityData);
      this.notifyListeners('ActivityCreated', activityData);
    });

    // Notifications
    this.connection.on('NotificationReceived', (notification: any) => {
      console.log('Notification received:', notification);
      this.notifyListeners('NotificationReceived', notification);
    });

    // Connection state changes
    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.notifyListeners('ConnectionStateChanged', { state: 'reconnecting' });
    });

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.notifyListeners('ConnectionStateChanged', { state: 'connected' });
    });

    this.connection.onclose(() => {
      console.log('SignalR connection closed');
      this.notifyListeners('ConnectionStateChanged', { state: 'disconnected' });
    });
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => listener(data));
  }

  private async startConnection() {
    if (!this.connection) return;

    try {
      await this.connection.start();
      console.log('SignalR connection started');
      this.notifyListeners('ConnectionStateChanged', { state: 'connected' });
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.notifyListeners('ConnectionStateChanged', { state: 'error', error });
      
      // Retry connection after 5 seconds
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  public addEventListener(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public removeEventListener(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  public async joinGroup(groupName: string) {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('JoinGroup', groupName);
        console.log(`Joined group: ${groupName}`);
      } catch (error) {
        console.error(`Error joining group ${groupName}:`, error);
      }
    }
  }

  public async leaveGroup(groupName: string) {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        await this.connection.invoke('LeaveGroup', groupName);
        console.log(`Left group: ${groupName}`);
      } catch (error) {
        console.error(`Error leaving group ${groupName}:`, error);
      }
    }
  }

  public getConnectionState() {
    return this.connection?.state || 'Disconnected';
  }

  public reconnect() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.disconnect();
      this.initializeConnection();
    }
  }

  public disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
    this.listeners.clear();
  }
}

export const signalRService = new SignalRService();
export default signalRService;