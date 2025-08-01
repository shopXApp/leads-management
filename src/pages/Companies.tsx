import { useState } from 'react';
import { Plus, Search, Building2, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Company, CompanySize } from '@/types/crm';
import { apiService } from '@/services/api';
import { useOfflineFirst } from '@/hooks/useOfflineFirst';
import SyncStatus from '@/components/ui/sync-status';

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { 
    data: companies, 
    loading, 
    syncStatus, 
    error,
    actions 
  } = useOfflineFirst<Company>({
    tableName: 'companies',
    apiMethods: {
      getAll: (params) => apiService.getCompanies(params),
      create: (data) => apiService.createCompany(data),
      update: (id, data) => apiService.updateCompany(id, data),
      delete: (id) => apiService.deleteCompany(id)
    }
  });

  const handleSearch = () => {
    actions.refresh();
  };

  const getSizeBadgeVariant = (size: CompanySize) => {
    switch (size) {
      case CompanySize.Startup: return 'secondary';
      case CompanySize.Small: return 'outline';
      case CompanySize.Medium: return 'default';
      case CompanySize.Large: return 'secondary';
      case CompanySize.Enterprise: return 'default';
      default: return 'outline';
    }
  };

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    } else if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(0)}K`;
    }
    return `$${revenue}`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
          <SyncStatus showDetails={false} />
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={actions.refresh}
            disabled={loading || !syncStatus.isOnline}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <Filter className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
          <CardDescription>
            Manage your company database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No companies found</TableCell>
                </TableRow>
              ) : (
                 companies.map((company) => (
                   <TableRow key={company.localId || company.id}>
                     <TableCell className="flex items-center space-x-3">
                       <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                         <Building2 className="h-4 w-4" />
                       </div>
                       <div>
                         <div className="font-medium">{company.name}</div>
                         {company.website && (
                           <div className="text-sm text-muted-foreground">
                             {company.website}
                           </div>
                         )}
                         {!company.serverId && (
                           <div className="text-xs text-muted-foreground">Local only</div>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>{company.industry || '-'}</TableCell>
                     <TableCell>
                       {company.size && (
                         <Badge variant={getSizeBadgeVariant(company.size)}>
                           {company.size}
                         </Badge>
                       )}
                     </TableCell>
                     <TableCell>
                       {company.revenue ? formatRevenue(company.revenue) : '-'}
                     </TableCell>
                     <TableCell>{company.contacts?.length || 0}</TableCell>
                     <TableCell>{company.leads?.length || 0}</TableCell>
                     <TableCell>{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '-'}</TableCell>
                   </TableRow>
                 ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Companies;