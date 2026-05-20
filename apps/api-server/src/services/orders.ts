import * as repo from "../repos/orders";
import * as notificationsService from "./notifications";
import { HttpError } from "../middlewares/errorHandler";

const DEFAULT_STEPS = [
  "Commande confirmée",
  "Prise en charge par le vendeur",
  "En transit",
  "En cours de livraison",
  "Livré",
];

const STEP_INDEX_BY_STATUS: Record<string, number> = {
  processing: 0,
  in_transit: 2,
  delivered: 4,
  cancelled: -1,
};

export async function listOrders(
  userId: string,
  opts: { status?: repo.OrderStatus; role: "buyer" | "seller" | "any" },
) {
  const orders = await repo.listForUser(userId, opts);
  return { orders };
}

export async function getOrderDetail(orderId: string, userId: string) {
  const detail = await repo.findDetail(orderId);
  if (!detail) throw new HttpError(404, "Order not found");
  if (detail.buyerId !== userId && detail.sellerId !== userId) {
    throw new HttpError(404, "Order not found");
  }
  return detail;
}

export type DeliveryAddress = {
  name: string;
  city: string;
  phone: string;
  line1: string;
};

export async function createOrder(
  buyerId: string,
  data: {
    itemId: string;
    paymentMethod: repo.PaymentMethod;
    carrier?: repo.Carrier;
    deliveryAddress?: DeliveryAddress;
  },
) {
  const item = await repo.findItemForPurchase(data.itemId);
  if (!item) throw new HttpError(404, "Item not found");
  if (item.sellerId === buyerId) {
    throw new HttpError(400, "Cannot buy your own item");
  }
  if (await repo.hasActiveOrderForItem(data.itemId)) {
    throw new HttpError(409, "Item already has an active order");
  }

  const trackingId = `DK-${new Date().getFullYear()}-${Math.floor(
    Math.random() * 90000 + 10000,
  )}`;

  const order = await repo.createOrderWithTimeline({
    buyerId,
    sellerId: item.sellerId,
    itemId: item.id,
    totalPrice: item.price,
    paymentMethod: data.paymentMethod,
    carrier: data.carrier ?? "Wave Express",
    trackingId,
    eta: "2-4 jours ouvrés",
    steps: DEFAULT_STEPS,
    deliveryAddress: data.deliveryAddress ?? null,
  });

  await Promise.all([
    notificationsService.createNotification({
      userId: buyerId,
      title: "Commande confirmée",
      body: `${item.title} est en cours de traitement.`,
    }),
    notificationsService.createNotification({
      userId: item.sellerId,
      title: "Nouvelle vente",
      body: `${item.title} vient d'être commandé.`,
    }),
  ]);

  return order;
}

export async function cancelOrder(orderId: string, buyerId: string) {
  const existing = await repo.findById(orderId);
  if (!existing) throw new HttpError(404, "Order not found");
  if (existing.buyerId !== buyerId) throw new HttpError(403, "Only the buyer can cancel");
  if (existing.status !== "processing") {
    throw new HttpError(400, "Order cannot be cancelled");
  }
  const updated = await repo.updateStatusWithTimeline(orderId, "cancelled", -1);
  if (!updated) throw new HttpError(404, "Order not found");
  return updated;
}

export async function confirmReceipt(orderId: string, buyerId: string) {
  const existing = await repo.findById(orderId);
  if (!existing) throw new HttpError(404, "Order not found");
  if (existing.buyerId !== buyerId) throw new HttpError(403, "Only the buyer can confirm receipt");
  const updated = await repo.updateStatusWithTimeline(orderId, "delivered", STEP_INDEX_BY_STATUS.delivered);
  if (!updated) throw new HttpError(404, "Order not found");
  return updated;
}

export function quoteCheckout(itemPrice: string, _paymentMethod: repo.PaymentMethod) {
  const subtotal = Math.round(Number(itemPrice));
  const serviceFee = Math.round(subtotal * 0.05);
  return {
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
    currency: "XOF" as const,
  };
}

export async function updateOrderStatus(
  orderId: string,
  userId: string,
  status: repo.OrderStatus,
) {
  const existing = await repo.findById(orderId);
  if (!existing) throw new HttpError(404, "Order not found");
  if (existing.buyerId !== userId && existing.sellerId !== userId) {
    throw new HttpError(404, "Order not found");
  }

  const stepIndex = STEP_INDEX_BY_STATUS[status];
  const updated = await repo.updateStatusWithTimeline(orderId, status, stepIndex);
  if (!updated) throw new HttpError(404, "Order not found");
  return updated;
}
