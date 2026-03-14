import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterUser } from "@/hooks/useQueries";
import { AppUserRole } from "@/backend";
import { Store, User } from "lucide-react";
import { toast } from "sonner";

interface RoleSelectionProps {
  onComplete: () => void;
}

export function RoleSelection({ onComplete }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<AppUserRole | null>(null);
  const [name, setName] = useState("");
  const registerUser = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole || !name.trim()) {
      toast.error("Please enter your name and select a role");
      return;
    }

    try {
      await registerUser.mutateAsync({ name: name.trim(), role: selectedRole });
      toast.success("Welcome to FoodHub!");
      onComplete();
    } catch (error) {
      toast.error("Failed to register. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-2xl shadow-lift">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <span className="text-4xl">🍕</span>
          </div>
          <CardTitle className="text-3xl font-display">Welcome to FoodHub!</CardTitle>
          <CardDescription className="text-base mt-2">
            Let's set up your account. Choose how you'd like to use FoodHub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>I want to...</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === AppUserRole.customer
                      ? "ring-2 ring-primary shadow-md"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole(AppUserRole.customer)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">Order Food</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse restaurants, order meals, and get them delivered
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole === AppUserRole.restaurant_owner
                      ? "ring-2 ring-primary shadow-md"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole(AppUserRole.restaurant_owner)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                      <Store className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">Manage Restaurant</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your restaurant, manage menu, and fulfill orders
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!selectedRole || !name.trim() || registerUser.isPending}
            >
              {registerUser.isPending ? "Setting up..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
