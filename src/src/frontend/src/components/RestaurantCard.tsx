import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";
import type { Restaurant } from "@/backend";
import { Link } from "@tanstack/react-router";

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  return (
    <Link to="/restaurant/$id" params={{ id: restaurant.id.toString() }} className="block group">
      <Card className="overflow-hidden hover-lift opacity-0 animate-fade-in-up">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          {restaurant.rating > 0 && (
            <Badge className="absolute top-3 right-3 bg-card/95 text-card-foreground backdrop-blur-sm border-0 shadow-md">
              <Star className="w-3 h-3 fill-accent text-accent mr-1" />
              {restaurant.rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-display text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {restaurant.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {restaurant.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary" className="font-normal">
              {restaurant.cuisineType}
            </Badge>
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span>{Number(restaurant.deliveryTimeEstimate)} min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
