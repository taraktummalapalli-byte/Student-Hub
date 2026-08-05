import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { ItemCard } from "@/components/item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SearchX } from "lucide-react";
import { useGetPublicStats, useListItems } from "@workspace/api-client-react";

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useGetPublicStats();
  const { data: recentItems, isLoading: itemsLoading } = useListItems({ limit: 6 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 lg:py-32 relative overflow-hidden">
        {/* Abstract pattern background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-3xl">
          <Badge className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 mb-6 border-primary-foreground/20">
            Campus Community Board
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">
            Find what you lost. <br />
            <span className="text-accent">Return what you found.</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            The official student portal for connecting lost items with their rightful owners across campus.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search for keys, ID cards, electronics..." 
                className="pl-10 h-14 text-base bg-background text-foreground border-0 shadow-lg rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-medium text-lg">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b bg-card">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                {statsLoading ? "..." : stats?.totalItems || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Items</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-display font-bold text-destructive mb-2">
                {statsLoading ? "..." : stats?.totalLost || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lost Items</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-display font-bold text-accent-foreground mb-2">
                {statsLoading ? "..." : stats?.totalFound || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Found Items</div>
            </div>
            <div className="px-4">
              <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                {statsLoading ? "..." : stats?.totalUsers || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-20 container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold mb-2">Recently Posted</h2>
            <p className="text-muted-foreground">The latest lost and found items on campus.</p>
          </div>
          <Button variant="outline" onClick={() => setLocation('/browse')} className="hidden sm:inline-flex">
            View All Items
          </Button>
        </div>

        {itemsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-xl border h-[340px] bg-muted/50 animate-pulse"></div>
            ))}
          </div>
        ) : recentItems && recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">No items yet</h3>
            <p className="text-muted-foreground">Check back later or be the first to post.</p>
          </div>
        )}
        
        <div className="mt-10 text-center sm:hidden">
          <Button variant="outline" onClick={() => setLocation('/browse')} className="w-full">
            View All Items
          </Button>
        </div>
      </section>
    </Layout>
  );
}

// Temporary Badge component imported here to resolve reference in hero
import { Badge } from "@/components/ui/badge";
