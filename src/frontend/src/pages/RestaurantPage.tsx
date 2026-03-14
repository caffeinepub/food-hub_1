import { useParams, Link } from "@tanstack/react-router";
import { useRestaurant, useMenuItems, useAddToCart } from "@/hooks/useQueries";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Star, Utensils } from "lucide-react";
import { toast } from "sonner";
import { MenuItemCategory } from "@/backend";

const categoryLabels: Record<MenuItemCategory, string> = {
  appetizer: "Appetizers",
  main: "Main Courses",
  dessert: "Desserts",
  beverage: "Beverages",
};

const categoryOrder: MenuItemCategory[] = [
  MenuItemCategory.appetizer,
  MenuItemCategory.main,
  MenuItemCategory.dessert,
  MenuItemCategory.beverage,
];

export function RestaurantPage() {
  const { id } = useParams({ from: "/restaurant/$id" });
  const restaurantId = parseInt(id, 10);

  const { data: restaurant, isLoading: isLoadingRestaurant } = useRestaurant(restaurantId);
  const { data: menuItems, isLoading: isLoadingMenu } = useMenuItems(restaurantId);
  const addToCart = useAddToCart();

  const handleAddToCart = async (itemId: number) => {
    try {
      await addToCart.mutateAsync({ menuItemId: itemId, quantity: BigInt(1) });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    }
  };

  const groupedItems = menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<MenuItemCategory, typeof menuItems>) || {};

  const availableCategories = categoryOrder.filter((cat) => groupedItems[cat]?.length > 0);

  if (isLoadingRestaurant) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-24 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-12 w-full" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-16 text-center">
        <h2 className="text-2xl font-display font-semibold mb-4">Restaurant not found</h2>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Restaurant Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
        <div className="container py-8">
          <Button variant="ghost" asChild className="mb-6 opacity-0 animate-fade-in-up">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Restaurants
            </Link>
          </Button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lift opacity-0 animate-fade-in-up animate-delay-100">
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <span className="text-8xl">🍽️</span>
                </div>
              )}
            </div>

            <div className="space-y-4 opacity-0 animate-fade-in-up animate-delay-200">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
                  {restaurant.name}
                </h1>
                <p className="text-lg text-muted-foreground">{restaurant.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {restaurant.cuisineType}
                </Badge>
                {restaurant.rating > 0 && (
                  <div className="flex items-center gap-2 text-base">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>{Number(restaurant.deliveryTimeEstimate)} min delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container py-12">
        <h2 className="text-3xl font-display font-bold mb-8">Menu</h2>

        {isLoadingMenu ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : availableCategories.length > 0 ? (
          <Tabs defaultValue={availableCategories[0]} className="w-full">
            <TabsList className="w-full justify-start mb-8 flex-wrap h-auto gap-2">
              {availableCategories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-base">
                  {categoryLabels[category]}
                </TabsTrigger>
              ))}
            </TabsList>

            {availableCategories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedItems[category]?.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">No menu items yet</h3>
            <p className="text-muted-foreground">
              This restaurant is still setting up their menu. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
