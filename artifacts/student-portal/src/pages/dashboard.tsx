import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useGetDashboard, useDeleteItem } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemForm } from "./post-item";
import { PlusCircle, SearchX, Edit2, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDashboardQueryKey } from "@workspace/api-client-react";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import * as React from "react";

// Radix Dialog components inline
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-y-auto max-h-[90vh]",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-display font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;


export function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading, refetch } = useGetDashboard({
    query: { enabled: isAuthenticated }
  });

  const deleteMutation = useDeleteItem();
  const [editingItem, setEditingItem] = useState<any>(null);

  // Redirect if not logged in
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Item deleted" });
          refetch();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error deleting item" });
        }
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 pb-8 border-b">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your reported lost and found items.</p>
          </div>
          <Button onClick={() => setLocation("/post")} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Report New Item
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-24 bg-muted animate-pulse rounded-xl"></div>
              <div className="h-24 bg-muted animate-pulse rounded-xl"></div>
            </div>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Items Lost</p>
                  <p className="text-4xl font-display font-bold text-destructive">{dashboard?.totalLost || 0}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <SearchX className="w-8 h-8" />
                </div>
              </div>
              <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Items Found</p>
                  <p className="text-4xl font-display font-bold text-accent-foreground">{dashboard?.totalFound || 0}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent-foreground">
                  <Badge className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-transparent border-0"><span className="text-xl">✨</span></Badge>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-display font-semibold mb-4">Your Reports</h2>
            
            {dashboard?.items && dashboard.items.length > 0 ? (
              <div className="space-y-4">
                {dashboard.items.map((item) => (
                  <div key={item.id} className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-all hover:shadow-md">
                    <div className="w-full sm:w-24 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">No Image</div>
                      )}
                      <div className="absolute top-1 left-1 sm:hidden">
                        <Badge variant={item.type === "Lost" ? "destructive" : "accent"} className="text-[10px] px-1.5 py-0 h-4">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold font-display truncate">{item.title}</h3>
                        <Badge variant={item.type === "Lost" ? "destructive" : "accent"} className="hidden sm:inline-flex text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{item.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>{format(new Date(item.date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex w-full sm:w-auto gap-2 sm:flex-col lg:flex-row mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setLocation(`/items/${item.id}`)}>
                        <ExternalLink className="w-4 h-4 mr-2 lg:hidden xl:inline" />
                        View
                      </Button>
                      
                      <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => setEditingItem(item)}>
                            <Edit2 className="w-4 h-4 mr-2 lg:hidden xl:inline" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle className="mb-4">Edit Item: {item.title}</DialogTitle>
                          {editingItem?.id === item.id && (
                            <ItemForm 
                              initialData={item} 
                              isEdit={true} 
                              onSuccess={() => {
                                setEditingItem(null);
                                refetch();
                              }} 
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 flex-1 sm:flex-none" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 mr-2 lg:hidden xl:inline" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
                <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-6">You haven't posted any lost or found items.</p>
                <Button onClick={() => setLocation("/post")}>Post Your First Item</Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
