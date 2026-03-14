import { useState } from "react";
import { useRestaurants, useSearchRestaurants } from "@/hooks/useQueries";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  
  const { data: allRestaurants, isLoading: isLoadingAll } = useRestaurants();
  const { data: searchResults, isLoading: isSearching } = useSearchRestaurants(activeSearch);

  const restaurants = activeSearch ? searchResults : allRestaurants;
  const isLoading = activeSearch ? isSearching : isLoadingAll;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm.trim());
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6 opacity-0 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-balance">
              Delicious food,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                delivered fast
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Order from your favorite local restaurants and get fresh meals delivered to your door
            </p>
            
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto opacity-0 animate-fade-in-up animate-delay-100">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants or cuisines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg" className="px-8">
                Search
              </Button>
            </form>
            
            {activeSearch && (
              <Button variant="ghost" onClick={clearSearch} className="opacity-0 animate-fade-in-up animate-delay-200">
                Clear search
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="container py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            {activeSearch ? `Results for "${activeSearch}"` : "All Restaurants"}
          </h2>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${restaurants?.length ?? 0} restaurants available`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : restaurants && restaurants.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">
              {activeSearch ? "No restaurants found" : "No restaurants yet"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {activeSearch
                ? "Try adjusting your search terms"
                : "Check back soon for delicious options!"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
