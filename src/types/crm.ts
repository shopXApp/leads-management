export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status: LeadStatus;
  source: LeadSource;
  score?: number;
  address?: string;
  website?: string;
  description?: string;
  assignedToId?: string;
  assignedTo?: User;
  companyId?: string;
  customFields?: CustomFieldValue[];
  notes?: Note[];
  activities?: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id?: string;
  localId?: number;
  serverId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  companyId?: string;
  company?: Company;
  customFields?: CustomFieldValue[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id?: string;
  localId?: number;
  serverId?: string;
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  revenue?: number;
  address?: string;
  contacts?: Contact[];
  leads?: Lead[];
  opportunities?: Opportunity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Opportunity {
  id?: string;
  localId?: number;
  serverId?: string;
  title: string;
  description?: string;
  amount?: number;
  value?: number;
  stage: OpportunityStage;
  probability?: number;
  closeDate?: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  leadId?: string;
  lead?: Lead;
  contactId?: string;
  contact?: Contact;
  companyId?: string;
  company?: Company;
  assignedToId?: string;
  assignedTo?: User;
  customFields?: CustomFieldValue[];
  activities?: Activity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  isCompleted: boolean;
  leadId?: string;
  contactId?: string;
  opportunityId?: string;
  assignedToId?: string;
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  isRequired: boolean;
  entityType: EntityType;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValue {
  id: string;
  customFieldId: string;
  customField?: CustomField;
  entityId: string;
  entityType: EntityType;
  value: string;
}

export interface Note {
  id: string;
  content: string;
  entityType: EntityType;
  entityId: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface SmartView {
  id: string;
  name: string;
  description?: string;
  entityType: EntityType;
  filters: FilterCondition[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  isPublic: boolean;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface Dashboard {
  totalLeads: number;
  totalContacts: number;
  totalCompanies: number;
  totalOpportunities: number;
  totalRevenue: number;
  conversionRate: number;
  recentActivities: Activity[];
  leadsByStatus: LeadStatusCount[];
  opportunitiesByStage: OpportunityStageCount[];
  revenueByMonth: RevenueByMonth[];
}

export interface LeadStatusCount {
  status: LeadStatus;
  count: number;
}

export interface OpportunityStageCount {
  stage: OpportunityStage;
  count: number;
  value: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  target?: number;
}

// Enums
export enum UserRole {
  Admin = 'Admin',
  Manager = 'Manager',
  Sales = 'Sales',
  Marketing = 'Marketing'
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Proposal = 'Proposal',
  Won = 'Won',
  Lost = 'Lost'
}

export enum LeadSource {
  Website = 'Website',
  Referral = 'Referral',
  SocialMedia = 'SocialMedia',
  EmailCampaign = 'EmailCampaign',
  PhoneCampaign = 'PhoneCampaign',
  TradeShow = 'TradeShow',
  Other = 'Other'
}

export enum OpportunityStage {
  Lead = 'Lead',
  Qualified = 'Qualified',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  Won = 'Won',
  Lost = 'Lost',
  Prospecting = 'Prospecting',
  Qualification = 'Qualification',
  NeedsAnalysis = 'NeedsAnalysis',
  ClosedWon = 'ClosedWon',
  ClosedLost = 'ClosedLost'
}

export enum ActivityType {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  Task = 'Task',
  Note = 'Note',
  SMS = 'SMS'
}

export enum CustomFieldType {
  Text = 'Text',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
  Dropdown = 'Dropdown',
  MultiSelect = 'MultiSelect'
}

export enum EntityType {
  Lead = 'Lead',
  Contact = 'Contact',
  Company = 'Company',
  Opportunity = 'Opportunity'
}

export enum FilterOperator {
  Equals = 'equals',
  NotEquals = 'notEquals',
  Contains = 'contains',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  GreaterThanOrEqual = 'greaterThanOrEqual',
  LessThanOrEqual = 'lessThanOrEqual',
  In = 'in',
  NotIn = 'notIn',
  IsNull = 'isNull',
  IsNotNull = 'isNotNull'
}

export enum CompanySize {
  Startup = 'Startup',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  Enterprise = 'Enterprise'
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

// Real-time update types
export interface RealtimeUpdate {
  type: 'LEAD_UPDATED' | 'CONTACT_UPDATED' | 'OPPORTUNITY_UPDATED' | 'ACTIVITY_CREATED' | 'NOTIFICATION';
  entityType: EntityType;
  entityId: string;
  data: any;
  timestamp: string;
  userId: string;
}