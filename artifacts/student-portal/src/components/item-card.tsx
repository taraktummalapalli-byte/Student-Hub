import { Item } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";

export function ItemCard({ item }: { item: Item }) {
  const isLost = item.type === "Lost";
  
  return (
    <Link href={`/items/${item.id}`} className="block h-full group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-1">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.title} 
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
              <Tag className="w-12 h-12 opacity-20" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={isLost ? "destructive" : "accent"} className="px-3 py-1 text-sm shadow-sm">
              {item.type}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="p-4 pb-2">
          <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 shrink-0" />
            <span>{item.category}</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 border-t bg-card/50 flex justify-between items-center text-xs text-muted-foreground">
          <span>Posted by {item.userName}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
