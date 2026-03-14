import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/backend";
import type { Order } from "@/backend";
import { Clock, MapPin, Package } from "lucide-react";

interface OrderCardProps {
  order: Order;
  children?: React.ReactNode;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning text-warning-foreground" },
  preparing: { label: "Preparing", className: "bg-primary text-primary-foreground" },
  ready: { label: "Ready", className: "bg-accent text-accent-foreground" },
  delivered: { label: "Delivered", className: "bg-success text-success-foreground" },
};

export function OrderCard({ order, children }: OrderCardProps) {
  const statusInfo = statusConfig[order.status];
  const orderDate = new Date(Number(order.createdAt) / 1_000_000);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-display mb-2 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary shrink-0" />
              <span className="truncate">Order #{order.id}</span>
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{orderDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{order.deliveryAddress}</span>
              </div>
            </div>
          </div>
          <Badge className={`${statusInfo.className} border-0 whitespace-nowrap`}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                  {Number(item.quantity)}
                </Badge>
                <span>Menu Item #{item.menuItemId}</span>
              </div>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex items-center justify-between">
          <span className="font-display font-semibold">Total</span>
          <span className="font-display text-xl font-bold text-primary">
            ${order.total.toFixed(2)}
          </span>
        </div>
        {children && <div className="mt-4 border-t pt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}
