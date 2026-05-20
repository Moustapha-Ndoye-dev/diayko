import * as ordersRepo from "../repos/orders";
import * as reviewsRepo from "../repos/reviews";
import { HttpError } from "../middlewares/errorHandler";

export async function createOrderReview(orderId: string, buyerId: string, rating: number, comment: string | null) {
  if (rating < 1 || rating > 5) {
    throw new HttpError(400, "rating must be 1–5");
  }

  const order = await ordersRepo.findById(orderId);
  if (!order) {
    throw new HttpError(404, "Order not found");
  }
  if (order.buyerId !== buyerId) {
    throw new HttpError(403, "Only the buyer can review");
  }
  if (order.status !== "delivered") {
    throw new HttpError(400, "Can only review a delivered order");
  }

  const existing = await reviewsRepo.findByOrderAndReviewer(orderId, buyerId);
  if (existing) {
    throw new HttpError(409, "You already reviewed this order");
  }

  const rev = await reviewsRepo.insertReview({
    orderId,
    reviewerId: buyerId,
    rating,
    comment,
  });
  if (!rev) {
    throw new HttpError(500, "Failed to create review");
  }
  return rev;
}

export async function listSellerReviews(userId: string, page: number, limit: number) {
  return reviewsRepo.listForSeller(userId, page, limit);
}
