import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetItem, useDeleteItem } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, MapPin, Tag, User, Mail, ArrowLeft, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

export function ItemDetail() {
  const [, params] = useRoute("/items/:id");
  const id = Number(params?.id);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: item, isLoading, error } = useGetItem(id, {
    query: {
      enabled: !!id,
      queryKey: ["getItem", id] as any
    }
  });

  const deleteMutation = useDeleteItem();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({
            title: "Item deleted",
            description: "The item has been successfully removed.",
          });
          setLocation("/browse");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete the item.",
          });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-pulse">
          <div className="h-8 w-24 bg-muted rounded mb-8"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square bg-muted rounded-xl"></div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-10 w-3/4 bg-muted rounded"></div>
              <div className="h-6 w-1/4 bg-muted rounded"></div>
              <div className="h-32 w-full bg-muted rounded mt-6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !item) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Item Not Found</h2>
          <p className="text-muted-foreground mb-8">The item you are looking for does not exist or has been removed.</p>
          <Button onClick={() => setLocation("/browse")}>Back to Browse</Button>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === item.userId;
  const isAdmin = user?.role === "admin";
  const canModify = isOwner || isAdmin;
  const isLost = item.type === "Lost";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" className="mb-6 -ml-4" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-card rounded-2xl overflow-hidden border shadow-sm flex flex-col md:flex-row">
          {/* Image Side */}
          <div className="w-full md:w-1/2 relative bg-muted flex items-center justify-center min-h-[300px]">
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <Tag className="w-24 h-24 text-muted-foreground/30" />
            )}
            <div className="absolute top-4 left-4">
              <Badge variant={isLost ? "destructive" : "accent"} className="text-sm px-3 py-1 shadow-md">
                {item.type}
              </Badge>
            </div>
          </div>

          {/* Details Side */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
            <div className="flex-1">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  {item.title}
                </h1>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4 mb-8 pb-8 border-b">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  {item.category}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(item.date), "MMM d, yyyy")}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Description
                </h3>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              <div className="bg-secondary/50 rounded-xl p-6 mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item.userName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{item.contact}</span>
                  </div>
                </div>
              </div>
            </div>

            {canModify && (
              <div className="flex gap-3 pt-4 border-t">
                {isOwner && (
                  <Button variant="outline" className="flex-1" onClick={() => setLocation(`/dashboard`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Item
                  </Button>
                )}
                <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleteMutation.isPending}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
