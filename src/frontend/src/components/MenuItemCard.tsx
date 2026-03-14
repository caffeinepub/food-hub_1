import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenuItemCategory } from "@/backend";
import type { MenuItem } from "@/backend";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (itemId: number) => void;
}

const categoryColors: Record<MenuItemCategory, string> = {
  appetizer: "bg-accent text-accent-foreground",
  main: "bg-primary text-primary-foreground",
  dessert: "bg-secondary text-secondary-foreground",
  beverage: "bg-muted text-muted-foreground",
};

const categoryLabels: Record<MenuItemCategory, string> = {
  appetizer: "Appetizer",
  main: "Main Course",
  dessert: "Dessert",
  beverage: "Beverage",
};

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover-lift group">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-6xl">🍴</span>
          </div>
        )}
        <Badge className={`absolute top-3 left-3 ${categoryColors[item.category]} border-0 shadow-md`}>
          {categoryLabels[item.category]}
        </Badge>
        {!item.available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Unavailable
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg font-semibold line-clamp-1 flex-1">
            {item.name}
          </h3>
          <span className="font-display text-lg font-bold text-primary whitespace-nowrap">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(item.id)}
          disabled={!item.available}
          className="w-full group-hover:shadow-md transition-shadow"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
