import { useState } from "react";
import { useUserProfile, useRestaurants, useCreateRestaurant, useUpdateRestaurant } from "@/hooks/useQueries";
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/useQueries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Plus, Edit, Trash2, Utensils } from "lucide-react";
import { MenuItemCategory } from "@/backend";
import { toast } from "sonner";

export function DashboardPage() {
  const { data: profile } = useUserProfile();
  const { data: restaurants } = useRestaurants();
  const [activeTab, setActiveTab] = useState<"restaurant" | "menu">("restaurant");

  const ownedRestaurant = restaurants?.find((r) => r.owner.toString() === profile?.name);

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            Restaurant Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your restaurant details and menu items
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="restaurant">Restaurant Info</TabsTrigger>
            <TabsTrigger value="menu" disabled={!ownedRestaurant}>
              Menu Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurant">
            <RestaurantSection restaurant={ownedRestaurant} />
          </TabsContent>

          <TabsContent value="menu">
            {ownedRestaurant && <MenuSection restaurantId={ownedRestaurant.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RestaurantSection({ restaurant }: { restaurant: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();

  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    description: restaurant?.description || "",
    cuisineType: restaurant?.cuisineType || "",
    rating: restaurant?.rating?.toString() || "0",
    deliveryTimeEstimate: restaurant?.deliveryTimeEstimate?.toString() || "30",
    imageUrl: restaurant?.imageUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      cuisineType: formData.cuisineType.trim(),
      rating: parseFloat(formData.rating),
      deliveryTimeEstimate: BigInt(formData.deliveryTimeEstimate),
      imageUrl: formData.imageUrl.trim(),
    };

    try {
      if (restaurant) {
        await updateRestaurant.mutateAsync({ id: restaurant.id, ...data });
        toast.success("Restaurant updated!");
      } else {
        await createRestaurant.mutateAsync(data);
        toast.success("Restaurant created!");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(restaurant ? "Failed to update restaurant" : "Failed to create restaurant");
      console.error(error);
    }
  };

  if (!restaurant && !isEditing) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Store className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">No restaurant yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your restaurant profile to start receiving orders
          </p>
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Restaurant
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isEditing || !restaurant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{restaurant ? "Edit Restaurant" : "Create Restaurant"}</CardTitle>
          <CardDescription>Update your restaurant information and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type *</Label>
                <Input
                  id="cuisine"
                  placeholder="e.g., Italian, Chinese, Mexican"
                  value={formData.cuisineType}
                  onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your restaurant..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time (min) *</Label>
                <Input
                  id="deliveryTime"
                  type="number"
                  min="1"
                  value={formData.deliveryTimeEstimate}
                  onChange={(e) => setFormData({ ...formData, deliveryTimeEstimate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createRestaurant.isPending || updateRestaurant.isPending}
              >
                {restaurant ? "Update Restaurant" : "Create Restaurant"}
              </Button>
              {restaurant && (
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
            <CardDescription className="mt-2">{restaurant.description}</CardDescription>
          </div>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {restaurant.imageUrl && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Cuisine</span>
              <div className="mt-1">
                <Badge variant="secondary">{restaurant.cuisineType}</Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Rating</span>
              <div className="mt-1 font-semibold">{restaurant.rating.toFixed(1)} / 5.0</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Delivery Time</span>
              <div className="mt-1 font-semibold">{Number(restaurant.deliveryTimeEstimate)} minutes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MenuSection({ restaurantId }: { restaurantId: number }) {
  const { data: menuItems, isLoading } = useMenuItems(restaurantId);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Menu Items</h2>
          <p className="text-muted-foreground">Manage your restaurant's menu</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {isLoading ? (
        <div>Loading menu items...</div>
      ) : menuItems && menuItems.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <MenuItemPreview
              key={item.id}
              item={item}
              onEdit={() => setEditingItem(item)}
              restaurantId={restaurantId}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No menu items yet. Add your first dish!</p>
          </CardContent>
        </Card>
      )}

      <MenuItemDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        restaurantId={restaurantId}
      />

      {editingItem && (
        <MenuItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          restaurantId={restaurantId}
          item={editingItem}
        />
      )}
    </div>
  );
}

function MenuItemPreview({ item, onEdit, restaurantId }: any) {
  const deleteMenuItem = useDeleteMenuItem();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      await deleteMenuItem.mutateAsync({ id: item.id, restaurantId });
      toast.success("Menu item deleted");
    } catch (error) {
      toast.error("Failed to delete menu item");
      console.error(error);
    }
  };

  return (
    <Card className={!item.available ? "opacity-60" : ""}>
      <CardContent className="p-4">
        {item.imageUrl && (
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold line-clamp-1">{item.name}</h3>
            <span className="font-bold text-primary whitespace-nowrap">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between pt-2">
            <Badge variant="outline">{item.category}</Badge>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={onEdit} className="h-8 w-8">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 w-8 text-destructive"
                disabled={deleteMenuItem.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MenuItemDialog({ open, onOpenChange, restaurantId, item }: any) {
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();

  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    category: item?.category || MenuItemCategory.main,
    imageUrl: item?.imageUrl || "",
    available: item?.available ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      imageUrl: formData.imageUrl.trim(),
      restaurantId,
    };

    try {
      if (item) {
        await updateMenuItem.mutateAsync({ id: item.id, ...data, available: formData.available });
        toast.success("Menu item updated!");
      } else {
        await createMenuItem.mutateAsync(data);
        toast.success("Menu item created!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(item ? "Failed to update menu item" : "Failed to create menu item");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the details of this menu item" : "Add a new item to your menu"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name *</Label>
              <Input
                id="item-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-description">Description *</Label>
            <Textarea
              id="item-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as MenuItemCategory })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MenuItemCategory.appetizer}>Appetizer</SelectItem>
                  <SelectItem value={MenuItemCategory.main}>Main Course</SelectItem>
                  <SelectItem value={MenuItemCategory.dessert}>Dessert</SelectItem>
                  <SelectItem value={MenuItemCategory.beverage}>Beverage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-imageUrl">Image URL</Label>
              <Input
                id="item-imageUrl"
                type="url"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          {item && (
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
              <Label htmlFor="available">Available for ordering</Label>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createMenuItem.isPending || updateMenuItem.isPending}>
              {item ? "Update Item" : "Add Item"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
