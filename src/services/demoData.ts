/**
 * Demo Data Service
 * 
 * Creates sample data for testing the offline-first CRM functionality
 */

import { indexedDBService } from './indexeddb';
import { Lead, Contact, Company, Opportunity, LeadStatus, LeadSource, OpportunityStage } from '@/types/crm';

export class DemoDataService {
  private static hasInitialized = false;

  /**
   * Initialize demo data if not already present
   */
  static async initializeDemoData(): Promise<void> {
    if (this.hasInitialized) return;

    try {
      await indexedDBService.init();

      // Check if we already have data
      const leads = await indexedDBService.getAll('leads');
      const contacts = await indexedDBService.getAll('contacts');
      const companies = await indexedDBService.getAll('companies');
      const opportunities = await indexedDBService.getAll('opportunities');

      // Only create demo data if tables are empty
      if (leads.length === 0 && contacts.length === 0 && companies.length === 0 && opportunities.length === 0) {
        console.log('Creating demo data...');
        await this.createDemoData();
      }

      this.hasInitialized = true;
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
    }
  }

  /**
   * Create sample data for all entities
   */
  private static async createDemoData(): Promise<void> {
    // Create demo companies
    const companies: Partial<Company>[] = [
      {
        name: 'Acme Corporation',
        industry: 'Technology',
        website: 'https://acme.com',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        revenue: 5000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Global Solutions Inc',
        industry: 'Consulting',
        website: 'https://globalsolutions.com',
        address: '456 Business Ave, New York, NY 10001',
        revenue: 3000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'InnovateTech LLC',
        industry: 'Software',
        website: 'https://innovatetech.com',
        address: '789 Innovation Blvd, Austin, TX 78701',
        revenue: 2000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const companyIds: number[] = [];
    for (const company of companies) {
      const id = await indexedDBService.add('companies', company);
      companyIds.push(id);
    }

    // Create demo contacts
    const contacts: Partial<Contact>[] = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@acme.com',
        phone: '+1-555-1001',
        jobTitle: 'CEO',
        companyId: companyIds[0].toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@globalsolutions.com',
        phone: '+1-555-1002',
        jobTitle: 'VP of Sales',
        companyId: companyIds[1].toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@innovatetech.com',
        phone: '+1-555-1003',
        jobTitle: 'CTO',
        companyId: companyIds[2].toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@freelancer.com',
        phone: '+1-555-1004',
        jobTitle: 'Marketing Consultant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const contactIds: number[] = [];
    for (const contact of contacts) {
      const id = await indexedDBService.add('contacts', contact);
      contactIds.push(id);
    }

    // Create demo leads
    const leads: Partial<Lead>[] = [
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@example.com',
        phone: '+1-555-2001',
        company: 'Wilson Enterprises',
        jobTitle: 'Director of Operations',
        status: LeadStatus.New,
        source: LeadSource.Website,
        score: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Lisa',
        lastName: 'Brown',
        email: 'lisa.brown@techstart.com',
        phone: '+1-555-2002',
        company: 'TechStart Inc',
        jobTitle: 'Founder',
        status: LeadStatus.Qualified,
        source: LeadSource.Referral,
        score: 92,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Robert',
        lastName: 'Davis',
        email: 'robert.davis@manufacturing.com',
        phone: '+1-555-2003',
        company: 'Davis Manufacturing',
        jobTitle: 'IT Manager',
        status: LeadStatus.Contacted,
        source: LeadSource.SocialMedia,
        score: 76,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        firstName: 'Jennifer',
        lastName: 'Garcia',
        email: 'jennifer.garcia@retail.com',
        phone: '+1-555-2004',
        company: 'Garcia Retail Solutions',
        jobTitle: 'VP Technology',
        status: LeadStatus.Qualified,
        source: LeadSource.TradeShow,
        score: 88,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const leadIds: number[] = [];
    for (const lead of leads) {
      const id = await indexedDBService.add('leads', lead);
      leadIds.push(id);
    }

    // Create demo opportunities
    const opportunities: Partial<Opportunity>[] = [
      {
        title: 'Acme Enterprise Package',
        description: 'Complete CRM solution for Acme Corporation including custom integrations',
        amount: 50000,
        stage: OpportunityStage.Proposal,
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        contactId: contactIds[0].toString(),
        companyId: companyIds[0].toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Global Solutions Consulting',
        description: 'CRM implementation and training services for Global Solutions',
        amount: 25000,
        stage: OpportunityStage.Negotiation,
        closeDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        contactId: contactIds[1].toString(),
        companyId: companyIds[1].toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'InnovateTech Startup Package',
        description: 'Discounted CRM package for startup company',
        amount: 15000,
        stage: OpportunityStage.Qualified,
        closeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
        contactId: contactIds[2].toString(),
        companyId: companyIds[2].toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Emily Rodriguez Consultation',
        description: 'Marketing automation setup and training',
        amount: 8000,
        stage: OpportunityStage.Won,
        closeDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        contactId: contactIds[3].toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const opportunity of opportunities) {
      await indexedDBService.add('opportunities', opportunity);
    }

    // Create some communication logs
    const communicationLogs = [
      {
        leadId: leadIds[0],
        type: 'email',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        notes: 'Sent initial proposal via email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        leadId: leadIds[1],
        type: 'call',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        notes: 'Discovery call - 45 minutes. Very positive response.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        leadId: leadIds[2],
        type: 'meeting',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        notes: 'In-person demo at their office. Technical team was impressed.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const log of communicationLogs) {
      await indexedDBService.add('communicationLogs', log);
    }

    console.log('Demo data created successfully!');
  }

  /**
   * Clear all demo data
   */
  static async clearDemoData(): Promise<void> {
    try {
      const tables = ['leads', 'contacts', 'companies', 'opportunities', 'communicationLogs'];
      
      for (const table of tables) {
        const items = await indexedDBService.getAll<any>(table);
        for (const item of items) {
          if (item.localId) {
            await indexedDBService.delete(table, item.localId);
          }
        }
      }

      this.hasInitialized = false;
      console.log('Demo data cleared successfully!');
    } catch (error) {
      console.error('Failed to clear demo data:', error);
    }
  }
}

export const demoDataService = DemoDataService;