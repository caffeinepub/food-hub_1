import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useUserProfile } from "@/hooks/useQueries";
import { useCart } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, User, LogOut, Store, Home } from "lucide-react";
import { AppUserRole } from "@/backend";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { loginStatus, clear, login } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: cart } = useCart();
  const navigate = useNavigate();

  const isLoggedIn = loginStatus === "success";
  const cartItemCount = cart?.items.reduce((sum, [item]) => sum + Number(item.quantity), 0) ?? 0;
  const isRestaurantOwner = profile?.role === AppUserRole.restaurant_owner;

  const handleLogout = async () => {
    await clear();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl">🍕</span>
          </div>
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FoodHub
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {!isRestaurantOwner && (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="relative">
                    <Link to="/cart">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs border-2 border-background">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-2 text-sm">
                    <div className="font-medium">{profile?.name || "User"}</div>
                    <div className="text-xs text-muted-foreground">
                      {isRestaurantOwner ? "Restaurant Owner" : "Customer"}
                    </div>
                  </div>
                  {isRestaurantOwner && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="w-full cursor-pointer">
                        <Store className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="w-full cursor-pointer">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={login} disabled={loginStatus === "logging-in"}>
              {loginStatus === "logging-in" ? "Connecting..." : "Login"}
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
