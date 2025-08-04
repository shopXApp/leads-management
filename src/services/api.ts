import { 
  ApiResponse, 
  PaginatedResponse, 
  AuthResponse, 
  User, 
  Lead, 
  Contact, 
  Company, 
  Opportunity, 
  Activity, 
  Dashboard,
  SmartView,
  CustomField
} from '@/types/crm';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7000/api/v1';

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Authentication failed');
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error');
    }
  }

  private async paginatedRequest<T>(
    endpoint: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      filters?: Record<string, any>;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(`filter.${key}`, value.toString());
        }
      });
    }

    const url = `${endpoint}?${queryParams.toString()}`;
    const response = await this.request<PaginatedResponse<T>>(url);
    return response.data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/auth/me');
    return response.data;
  }

  // Dashboard
  async getDashboard(): Promise<Dashboard> {
    const response = await this.request<Dashboard>('/dashboard');
    return response.data;
  }

  // Leads
  async getLeads(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
    assignedTo?: string;
  }): Promise<PaginatedResponse<Lead>> {
    return this.paginatedRequest<Lead>('/leads', params);
  }

  async getLead(id: string): Promise<Lead> {
    const response = await this.request<Lead>(`/leads/${id}`);
    return response.data;
  }

  async createLead(lead: Partial<Lead>): Promise<Lead> {
    const response = await this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
    return response.data;
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    const response = await this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    });
    return response.data;
  }

  async deleteLead(id: string): Promise<void> {
    await this.request(`/leads/${id}`, { method: 'DELETE' });
  }

  // Contacts
  async getContacts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    companyId?: string;
  }): Promise<PaginatedResponse<Contact>> {
    return this.paginatedRequest<Contact>('/contacts', params);
  }

  async getContact(id: string): Promise<Contact> {
    const response = await this.request<Contact>(`/contacts/${id}`);
    return response.data;
  }

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    const response = await this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
    return response.data;
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    const response = await this.request<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
    return response.data;
  }

  async deleteContact(id: string): Promise<void> {
    await this.request(`/contacts/${id}`, { method: 'DELETE' });
  }

  // Companies
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
  }): Promise<PaginatedResponse<Company>> {
    return this.paginatedRequest<Company>('/companies', params);
  }

  async getCompany(id: string): Promise<Company> {
    const response = await this.request<Company>(`/companies/${id}`);
    return response.data;
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    const response = await this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
    return response.data;
  }

  async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    const response = await this.request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
    return response.data;
  }

  async deleteCompany(id: string): Promise<void> {
    await this.request(`/companies/${id}`, { method: 'DELETE' });
  }

  // Opportunities
  async getOpportunities(params?: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string;
    assignedTo?: string;
  }): Promise<PaginatedResponse<Opportunity>> {
    return this.paginatedRequest<Opportunity>('/opportunities', params);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    const response = await this.request<Opportunity>(`/opportunities/${id}`);
    return response.data;
  }

  async createOpportunity(opportunity: Partial<Opportunity>): Promise<Opportunity> {
    const response = await this.request<Opportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    });
    return response.data;
  }

  async updateOpportunity(id: string, opportunity: Partial<Opportunity>): Promise<Opportunity> {
    const response = await this.request<Opportunity>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opportunity),
    });
    return response.data;
  }

  async deleteOpportunity(id: string): Promise<void> {
    await this.request(`/opportunities/${id}`, { method: 'DELETE' });
  }

  // Activities
  async getActivities(params?: {
    page?: number;
    limit?: number;
    entityType?: string;
    entityId?: string;
    type?: string;
  }): Promise<PaginatedResponse<Activity>> {
    return this.paginatedRequest<Activity>('/activities', params);
  }

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    const response = await this.request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
    return response.data;
  }

  async updateActivity(id: string, activity: Partial<Activity>): Promise<Activity> {
    const response = await this.request<Activity>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activity),
    });
    return response.data;
  }

  async deleteActivity(id: string): Promise<void> {
    await this.request(`/activities/${id}`, { method: 'DELETE' });
  }

  // Smart Views
  async getSmartViews(entityType?: string): Promise<SmartView[]> {
    const response = await this.request<SmartView[]>(`/smartviews${entityType ? `?entityType=${entityType}` : ''}`);
    return response.data;
  }

  async createSmartView(smartView: Partial<SmartView>): Promise<SmartView> {
    const response = await this.request<SmartView>('/smartviews', {
      method: 'POST',
      body: JSON.stringify(smartView),
    });
    return response.data;
  }

  // Custom Fields
  async getCustomFields(entityType?: string): Promise<CustomField[]> {
    const response = await this.request<CustomField[]>(`/customfields${entityType ? `?entityType=${entityType}` : ''}`);
    return response.data;
  }

  async createCustomField(customField: Partial<CustomField>): Promise<CustomField> {
    const response = await this.request<CustomField>('/customfields', {
      method: 'POST',
      body: JSON.stringify(customField),
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;