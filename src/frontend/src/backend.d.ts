import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface OrderItem {
    quantity: bigint;
    price: number;
    menuItemId: MenuItemId;
}
export type RestaurantId = number;
export interface Order {
    id: OrderId;
    status: OrderStatus;
    deliveryAddress: string;
    total: number;
    userId: Principal;
    createdAt: Time;
    updatedAt: Time;
    items: Array<OrderItem>;
}
export interface Restaurant {
    id: RestaurantId;
    owner: Principal;
    name: string;
    cuisineType: string;
    description: string;
    deliveryTimeEstimate: bigint;
    imageUrl: string;
    rating: number;
}
export interface MenuItem {
    id: MenuItemId;
    name: string;
    description: string;
    available: boolean;
    restaurantId: RestaurantId;
    imageUrl: string;
    category: MenuItemCategory;
    price: number;
}
export type MenuItemId = number;
export type CartItemId = number;
export interface CartItem {
    id: CartItemId;
    userId: Principal;
    quantity: bigint;
    menuItemId: MenuItemId;
}
export interface UserProfile {
    name: string;
    role: AppUserRole;
}
export type OrderId = number;
export enum AppUserRole {
    customer = "customer",
    restaurant_owner = "restaurant_owner"
}
export enum MenuItemCategory {
    dessert = "dessert",
    main = "main",
    appetizer = "appetizer",
    beverage = "beverage"
}
export enum OrderStatus {
    preparing = "preparing",
    pending = "pending",
    delivered = "delivered",
    ready = "ready"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(menuItemId: MenuItemId, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMenuItem(name: string, description: string, price: number, category: MenuItemCategory, imageUrl: string, restaurantId: RestaurantId): Promise<MenuItemId>;
    createRestaurant(name: string, description: string, cuisineType: string, rating: number, deliveryTimeEstimate: bigint, imageUrl: string): Promise<RestaurantId>;
    deleteMenuItem(id: MenuItemId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<{
        total: number;
        items: Array<[CartItem, MenuItem]>;
    }>;
    getMenuItem(id: MenuItemId): Promise<MenuItem | null>;
    getOrderHistory(): Promise<Array<Order>>;
    getRestaurant(id: RestaurantId): Promise<Restaurant | null>;
    getRestaurantOrders(restaurantId: RestaurantId): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listMenuItems(restaurantId: RestaurantId): Promise<Array<MenuItem>>;
    listRestaurants(): Promise<Array<Restaurant>>;
    placeOrder(deliveryAddress: string): Promise<OrderId>;
    registerUser(name: string, role: AppUserRole): Promise<void>;
    removeFromCart(cartItemId: CartItemId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchRestaurants(searchTerm: string): Promise<Array<Restaurant>>;
    updateCartItemQuantity(cartItemId: CartItemId, quantity: bigint): Promise<void>;
    updateMenuItem(id: MenuItemId, name: string, description: string, price: number, category: MenuItemCategory, imageUrl: string, available: boolean): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateRestaurant(id: RestaurantId, name: string, description: string, cuisineType: string, rating: number, deliveryTimeEstimate: bigint, imageUrl: string): Promise<void>;
}
