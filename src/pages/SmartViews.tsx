import { useState, useEffect } from 'react';
import { Plus, Filter, Search, Share, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SmartView, EntityType } from '@/types/crm';
import { apiService } from '@/services/api';

const SmartViews = () => {
  const [smartViews, setSmartViews] = useState<SmartView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSmartViews();
  }, [activeTab]);

  const fetchSmartViews = async () => {
    try {
      setLoading(true);
      const entityType = activeTab !== 'all' ? activeTab : undefined;
      const views = await apiService.getSmartViews(entityType);
      setSmartViews(views);
    } catch (error) {
      console.error('Failed to fetch smart views:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredViews = smartViews.filter(view =>
    view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    view.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEntityBadgeVariant = (entityType: EntityType) => {
    switch (entityType) {
      case EntityType.Lead: return 'default';
      case EntityType.Contact: return 'secondary';
      case EntityType.Company: return 'outline';
      case EntityType.Opportunity: return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Smart Views</h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create View
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Smart View</DialogTitle>
                <DialogDescription>
                  Create a new smart view to save filtered data for quick access.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">View Name</label>
                  <Input placeholder="My Hot Leads" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="High priority leads that need immediate attention" />
                </div>
                <div>
                  <label className="text-sm font-medium">Entity Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EntityType).map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Button>Create View</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search views..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Views</TabsTrigger>
          <TabsTrigger value={EntityType.Lead}>Leads</TabsTrigger>
          <TabsTrigger value={EntityType.Contact}>Contacts</TabsTrigger>
          <TabsTrigger value={EntityType.Company}>Companies</TabsTrigger>
          <TabsTrigger value={EntityType.Opportunity}>Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-8">Loading...</div>
            ) : filteredViews.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No smart views found
              </div>
            ) : (
              filteredViews.map((view) => (
                <Card key={view.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{view.name}</CardTitle>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{view.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={getEntityBadgeVariant(view.entityType)}>
                          {view.entityType}
                        </Badge>
                        <Badge variant={view.isPublic ? 'default' : 'secondary'}>
                          {view.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Filters: {view.filters.length}</div>
                        {view.sortBy && (
                          <div>Sort: {view.sortBy} ({view.sortDirection})</div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Created by {view.owner?.firstName} {view.owner?.lastName}
                        <br />
                        {new Date(view.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Views Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Views</CardTitle>
          <CardDescription>
            Commonly used pre-built views for quick access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              My Hot Leads
            </Button>
            <Button variant="outline" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              New This Week
            </Button>
            <Button variant="outline" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              Closing Soon
            </Button>
            <Button variant="outline" className="justify-start">
              <Filter className="mr-2 h-4 w-4" />
              High Value Deals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartViews;