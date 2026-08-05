import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { ItemCard } from "@/components/item-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SearchX } from "lucide-react";
import { useListItems } from "@workspace/api-client-react";
import type { ListItemsType } from "@workspace/api-client-react/src/generated/api.schemas";

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Accessories",
  "Books",
  "Keys",
  "Wallet",
  "ID/Cards",
  "Sports Equipment",
  "Other"
];

export function Browse() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const [, setLocation] = useLocation();

  const initialSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  
  const [filters, setFilters] = useState({
    search: initialSearch,
    category: searchParams.get("category") || "All",
    type: (searchParams.get("type") as ListItemsType | "All") || "All",
  });

  const queryParams = useMemo(() => {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.category !== "All") params.category = filters.category;
    if (filters.type !== "All") params.type = filters.type;
    return params;
  }, [filters]);

  const { data: items, isLoading } = useListItems(queryParams);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
    
    // Update URL
    const newParams = new URLSearchParams();
    if (searchInput) newParams.set("search", searchInput);
    if (filters.category !== "All") newParams.set("category", filters.category);
    if (filters.type !== "All") newParams.set("type", filters.type);
    
    const newQs = newParams.toString();
    setLocation(newQs ? `/browse?${newQs}` : "/browse", { replace: true });
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const newParams = new URLSearchParams();
    if (newFilters.search) newParams.set("search", newFilters.search);
    if (newFilters.category !== "All") newParams.set("category", newFilters.category);
    if (newFilters.type !== "All") newParams.set("type", newFilters.type);
    
    const newQs = newParams.toString();
    setLocation(newQs ? `/browse?${newQs}` : "/browse", { replace: true });
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <h1 className="text-3xl font-display font-bold tracking-tight mb-6">Browse Items</h1>
          
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search keywords..." 
                className="pl-10 h-12 bg-background"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="w-full md:w-48">
                <Select value={filters.type} onValueChange={(val) => updateFilter("type", val)}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                    <SelectItem value="Found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={filters.category} onValueChange={(val) => updateFilter("category", val)}>
                  <SelectTrigger className="h-12 bg-background">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="h-12 hidden md:inline-flex">Filter</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="rounded-xl border h-[340px] bg-muted/50 animate-pulse"></div>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div>
            <div className="mb-6 text-muted-foreground text-sm font-medium">
              Showing {items.length} result{items.length === 1 ? "" : "s"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed max-w-2xl mx-auto mt-8">
            <SearchX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-display font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6">We couldn't find anything matching your filters.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchInput("");
                setFilters({ search: "", category: "All", type: "All" });
                setLocation("/browse");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
