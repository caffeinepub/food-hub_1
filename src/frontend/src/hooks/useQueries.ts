import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Restaurant,
  MenuItem,
  Order,
  CartItem,
  UserProfile,
  AppUserRole,
  OrderStatus,
  MenuItemCategory,
  RestaurantId,
  MenuItemId,
  OrderId,
  CartItemId,
} from "@/backend";

// User Profile
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, role }: { name: string; role: AppUserRole }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.registerUser(name, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// Restaurants
export function useRestaurants() {
  const { actor, isFetching } = useActor();
  return useQuery<Restaurant[]>({
    queryKey: ["restaurants"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRestaurants();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRestaurant(id: RestaurantId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Restaurant | null>({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getRestaurant(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useSearchRestaurants(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Restaurant[]>({
    queryKey: ["restaurants", "search", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchRestaurants(searchTerm);
    },
    enabled: !!actor && !isFetching && !!searchTerm,
  });
}

export function useCreateRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      cuisineType: string;
      rating: number;
      deliveryTimeEstimate: bigint;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createRestaurant(
        data.name,
        data.description,
        data.cuisineType,
        data.rating,
        data.deliveryTimeEstimate,
        data.imageUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useUpdateRestaurant() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: RestaurantId;
      name: string;
      description: string;
      cuisineType: string;
      rating: number;
      deliveryTimeEstimate: bigint;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateRestaurant(
        data.id,
        data.name,
        data.description,
        data.cuisineType,
        data.rating,
        data.deliveryTimeEstimate,
        data.imageUrl
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant", variables.id] });
    },
  });
}

// Menu Items
export function useMenuItems(restaurantId: RestaurantId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems", restaurantId],
    queryFn: async () => {
      if (!actor || restaurantId === undefined) return [];
      return actor.listMenuItems(restaurantId);
    },
    enabled: !!actor && !isFetching && restaurantId !== undefined,
  });
}

export function useMenuItem(id: MenuItemId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem | null>({
    queryKey: ["menuItem", id],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getMenuItem(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useCreateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
      category: MenuItemCategory;
      imageUrl: string;
      restaurantId: RestaurantId;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createMenuItem(
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.restaurantId
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", variables.restaurantId] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      id: MenuItemId;
      name: string;
      description: string;
      price: number;
      category: MenuItemCategory;
      imageUrl: string;
      available: boolean;
      restaurantId: RestaurantId;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateMenuItem(
        data.id,
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.available
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["menuItem", variables.id] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: MenuItemId; restaurantId: RestaurantId }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteMenuItem(data.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", variables.restaurantId] });
    },
  });
}

// Cart
export function useCart() {
  const { actor, isFetching } = useActor();
  return useQuery<{ items: Array<[CartItem, MenuItem]>; total: number }>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return { items: [], total: 0 };
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ menuItemId, quantity }: { menuItemId: MenuItemId; quantity: bigint }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addToCart(menuItemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: CartItemId; quantity: bigint }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateCartItemQuantity(cartItemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cartItemId: CartItemId) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.removeFromCart(cartItemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// Orders
export function useOrderHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrderHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRestaurantOrders(restaurantId: RestaurantId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["restaurantOrders", restaurantId],
    queryFn: async () => {
      if (!actor || restaurantId === undefined) return [];
      return actor.getRestaurantOrders(restaurantId);
    },
    enabled: !!actor && !isFetching && restaurantId !== undefined,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deliveryAddress: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.placeOrder(deliveryAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: OrderId; status: OrderStatus }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["restaurantOrders"] });
    },
  });
}
