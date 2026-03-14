import { useUserProfile, useOrderHistory, useRestaurantOrders, useUpdateOrderStatus } from "@/hooks/useQueries";
import { useRestaurants } from "@/hooks/useQueries";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ShoppingBag } from "lucide-react";
import { AppUserRole, OrderStatus } from "@/backend";
import { toast } from "sonner";

export function OrdersPage() {
  const { data: profile } = useUserProfile();
  const { data: restaurants } = useRestaurants();
  const isRestaurantOwner = profile?.role === AppUserRole.restaurant_owner;

  // Find the restaurant owned by this user
  const ownedRestaurant = isRestaurantOwner
    ? restaurants?.find((r) => r.owner.toString() === profile?.name)
    : undefined;

  const { data: customerOrders, isLoading: isLoadingCustomer } = useOrderHistory();
  const { data: restaurantOrders, isLoading: isLoadingRestaurant } = useRestaurantOrders(
    ownedRestaurant?.id
  );
  const updateOrderStatus = useUpdateOrderStatus();

  const orders = isRestaurantOwner ? restaurantOrders : customerOrders;
  const isLoading = isRestaurantOwner ? isLoadingRestaurant : isLoadingCustomer;

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !orders || orders.length === 0;

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
          {isRestaurantOwner ? (
            <>
              <Package className="w-8 h-8 text-primary" />
              Restaurant Orders
            </>
          ) : (
            <>
              <ShoppingBag className="w-8 h-8 text-primary" />
              My Orders
            </>
          )}
        </h1>
        <p className="text-muted-foreground mb-8">
          {isRestaurantOwner
            ? `Manage incoming orders for ${ownedRestaurant?.name || "your restaurant"}`
            : "Track your order history and delivery status"}
        </p>

        {isEmpty ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">
              {isRestaurantOwner
                ? "Orders will appear here once customers start ordering"
                : "Start ordering from your favorite restaurants!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order}>
                {isRestaurantOwner && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Update Status</label>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusUpdate(order.id, value as OrderStatus)}
                      disabled={updateOrderStatus.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                        <SelectItem value={OrderStatus.preparing}>Preparing</SelectItem>
                        <SelectItem value={OrderStatus.ready}>Ready</SelectItem>
                        <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </OrderCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
