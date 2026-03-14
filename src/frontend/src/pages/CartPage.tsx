import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCart, useUpdateCartItem, useRemoveFromCart, usePlaceOrder } from "@/hooks/useQueries";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Minus, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export function CartPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const placeOrder = usePlaceOrder();
  
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleUpdateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem.mutateAsync({ cartItemId, quantity: BigInt(newQuantity) });
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error(error);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeFromCart.mutateAsync(cartItemId);
      toast.success("Removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error(error);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    try {
      await placeOrder.mutateAsync(deliveryAddress.trim());
      toast.success("Order placed successfully!");
      setDeliveryAddress("");
      navigate({ to: "/orders" });
    } catch (error) {
      toast.error("Failed to place order");
      console.error(error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Your Cart
        </h1>

        {isEmpty ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some delicious items to get started!
            </p>
            <Button onClick={() => navigate({ to: "/" })}>
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(([cartItem, menuItem]) => {
                const quantity = Number(cartItem.quantity);
                const itemTotal = menuItem.price * quantity;

                return (
                  <Card key={cartItem.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          {menuItem.imageUrl ? (
                            <img
                              src={menuItem.imageUrl}
                              alt={menuItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl">🍴</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-lg mb-1 truncate">
                            {menuItem.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {menuItem.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(cartItem.id, quantity - 1)}
                                disabled={quantity <= 1 || updateCartItem.isPending}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => handleUpdateQuantity(cartItem.id, quantity + 1)}
                                disabled={updateCartItem.isPending}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveItem(cartItem.id)}
                              disabled={removeFromCart.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            ${menuItem.price.toFixed(2)} each
                          </div>
                          <div className="font-display font-bold text-lg text-primary">
                            ${itemTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-xl mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${cart.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span className="font-medium">$2.99</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-display font-semibold text-lg">Total</span>
                      <span className="font-display font-bold text-xl text-primary">
                        ${(cart.total + 2.99).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="123 Main St, City, State"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isCheckingOut || !deliveryAddress.trim()}
                    >
                      {isCheckingOut ? "Placing Order..." : "Place Order"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
