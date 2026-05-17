import * as repo from "../repos/orders";
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

export async function createOrder(
  buyerId: string,
  data: { itemId: string; paymentMethod: repo.PaymentMethod; carrier?: repo.Carrier },
) {
  const item = await repo.findItemForPurchase(data.itemId);
  if (!item) throw new HttpError(404, "Item not found");
  if (item.sellerId === buyerId) {
    throw new HttpError(400, "Cannot buy your own item");
  }

  const trackingId = `DK-${new Date().getFullYear()}-${Math.floor(
    Math.random() * 90000 + 10000,
  )}`;

  return repo.createOrderWithTimeline({
    buyerId,
    sellerId: item.sellerId,
    itemId: item.id,
    totalPrice: item.price,
    paymentMethod: data.paymentMethod,
    carrier: data.carrier ?? "Wave Express",
    trackingId,
    eta: "2-4 jours ouvrés",
    steps: DEFAULT_STEPS,
  });
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
