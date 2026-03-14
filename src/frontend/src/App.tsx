import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useUserProfile } from "@/hooks/useQueries";
import { RoleSelection } from "@/components/RoleSelection";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HomePage } from "@/pages/HomePage";
import { RestaurantPage } from "@/pages/RestaurantPage";
import { CartPage } from "@/pages/CartPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { DashboardPage } from "@/pages/DashboardPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/$id",
  component: RestaurantPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  restaurantRoute,
  cartRoute,
  ordersRoute,
  dashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { loginStatus, login, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile();

  const isLoggedIn = loginStatus === "success";
  const isLoading = isInitializing || (isLoggedIn && isLoadingProfile);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <span className="text-4xl">🍕</span>
          </div>
          <p className="text-muted-foreground">Loading FoodHub...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="w-full max-w-md text-center space-y-8">
          <div>
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🍕</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FoodHub
            </h1>
            <p className="text-lg text-muted-foreground">
              Delicious food, delivered fast
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Connect with Internet Identity to get started
            </p>
            <Button
              size="lg"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="w-full"
            >
              {loginStatus === "logging-in" ? "Connecting..." : "Login with Internet Identity"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <RoleSelection onComplete={() => window.location.reload()} />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
