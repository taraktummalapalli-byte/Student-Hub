import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  useGetAdminStats, 
  useListAdminUsers, 
  useListAdminItems, 
  useDeleteAdminItem 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Trash2, Users, LayoutList, Activity } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListAdminItemsQueryKey, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";

export function Admin() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<"stats" | "items" | "users">("stats");

  // Auth Guard
  if (isAuthenticated !== undefined && !isAuthenticated) {
    setLocation("/login");
    return null;
  }
  
  if (isAuthenticated && !isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-lg">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl font-display font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">You do not have administrative privileges to view this page. If you believe this is an error, please contact IT support.</p>
          <Button onClick={() => setLocation("/dashboard")}>Return to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ query: { enabled: isAdmin && activeTab === "stats" } });
  const { data: items, isLoading: itemsLoading, refetch: refetchItems } = useListAdminItems({ query: { enabled: isAdmin && activeTab === "items" } });
  const { data: users, isLoading: usersLoading } = useListAdminUsers({ query: { enabled: isAdmin && activeTab === "users" } });
  
  const deleteMutation = useDeleteAdminItem();

  const handleDeleteItem = (id: number) => {
    if (confirm("ADMIN: Permanently delete this item from the platform?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Item removed from platform" });
          refetchItems();
          queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to remove item" });
        }
      });
    }
  };

  return (
    <Layout>
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-8 flex items-center gap-4">
          <div className="p-3 bg-red-500 rounded-lg">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Admin Console</h1>
            <p className="text-slate-400">Manage platform content and users</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex border-b mb-8 overflow-x-auto hide-scrollbar">
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('stats')}
          >
            <Activity className="w-4 h-4" />
            Platform Stats
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'items' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('items')}
          >
            <LayoutList className="w-4 h-4" />
            All Items Content
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-4 h-4" />
            Registered Users
          </button>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Platform Users</CardDescription>
                    <CardTitle className="text-4xl">{stats?.totalUsers || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Items Posted</CardDescription>
                    <CardTitle className="text-4xl">{stats?.totalItems || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Lost Items Active</CardDescription>
                    <CardTitle className="text-4xl text-destructive">{stats?.totalLost || 0}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Found Items Active</CardDescription>
                    <CardTitle className="text-4xl text-accent-foreground">{stats?.totalFound || 0}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Posted By</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {itemsLoading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading items...</td></tr>
                  ) : items?.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No items on platform.</td></tr>
                  ) : items?.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 text-muted-foreground">#{item.id}</td>
                      <td className="px-6 py-4">
                        <Badge variant={item.type === "Lost" ? "destructive" : "accent"}>{item.type}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate">{item.title}</td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-[150px]">{item.userName}</div>
                        <div className="text-xs text-muted-foreground">ID: {item.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(item.createdAt), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/items/${item.id}`)}>
                          View
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">ID</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersLoading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading users...</td></tr>
                  ) : users?.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
                  ) : users?.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 text-muted-foreground">#{u.id}</td>
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={(u as any).role === "admin" ? "bg-red-100 text-red-800 border-red-200" : ""}>
                          {(u as any).role || "student"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
