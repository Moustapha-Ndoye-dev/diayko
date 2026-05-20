import * as itemsRepo from "../repos/items";
import * as notificationsService from "./notifications";
import { HttpError } from "../middlewares/errorHandler";

/**
 * Business logic for items. Routes should be thin: validate input, then call
 * one of these services. All DB access goes through `repos/items.ts`.
 */

export async function listItems(filters: itemsRepo.ListItemsFilters) {
  const { items, total } = await itemsRepo.list(filters);
  return {
    items,
    total,
    page: filters.page,
    limit: filters.limit,
    hasMore: filters.page * filters.limit < total,
  };
}

export async function getItemDetail(id: string) {
  const row = await itemsRepo.findByIdWithSeller(id);
  if (!row) throw new HttpError(404, "Item not found");
  const [withImages] = await itemsRepo.attachImages([row.items]);
  return { ...withImages, seller: row.users };
}

export interface CreateItemInput {
  title: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  size: string;
  condition: string;
  category: string;
  description: string;
  color?: string | null;
  images: string[];
}

export async function createItem(sellerId: string, data: CreateItemInput) {
  const { images, ...itemData } = data;
  const item = await itemsRepo.insertItem({ ...itemData, sellerId });
  if (!item) throw new HttpError(500, "Failed to create item");
  await itemsRepo.insertImages(item.id, images);
  return { ...item, images };
}

export async function updateItemOwned(
  itemId: string,
  sellerId: string,
  data: Partial<Omit<CreateItemInput, "images">> & { images?: string[] },
) {
  const ownerId = await itemsRepo.findSellerId(itemId);
  if (!ownerId) throw new HttpError(404, "Item not found");
  if (ownerId !== sellerId) throw new HttpError(403, "Forbidden");

  const { images, ...rest } = data;
  const patch: Parameters<typeof itemsRepo.updateItemForSeller>[2] = { ...rest };
  if (images !== undefined) patch.images = images;
  const item = await itemsRepo.updateItemForSeller(itemId, sellerId, patch);
  if (!item) throw new HttpError(500, "Failed to update item");
  return item;
}

export async function deleteItemAsOwner(itemId: string, userId: string) {
  const sellerId = await itemsRepo.findSellerId(itemId);
  if (!sellerId) throw new HttpError(404, "Item not found");
  if (sellerId !== userId) throw new HttpError(403, "Forbidden");
  await itemsRepo.deleteItem(itemId);
}

export async function recordView(itemId: string) {
  const viewsCount = await itemsRepo.incrementViews(itemId);
  if (viewsCount === null) throw new HttpError(404, "Item not found");
  return { viewsCount };
}

export async function toggleLike(userId: string, itemId: string) {
  const existing = await itemsRepo.findLike(userId, itemId);
  let liked: boolean;
  if (existing) {
    await itemsRepo.removeLike(userId, itemId);
    liked = false;
  } else {
    await itemsRepo.addLike(userId, itemId);
    liked = true;
    const row = await itemsRepo.findByIdWithSeller(itemId);
    if (row?.items.sellerId && row.items.sellerId !== userId) {
      await notificationsService.createNotification({
        userId: row.items.sellerId,
        title: "Nouvel article en favori",
        body: `${row.items.title} vient de recevoir un favori.`,
      });
    }
  }
  const likesCount = await itemsRepo.getLikesCount(itemId);
  return { liked, likesCount };
}

export async function listForSeller(sellerId: string, page: number, limit: number) {
  const { items, total } = await itemsRepo.listBySeller(sellerId, page, limit);
  return { items, total, page, limit, hasMore: page * limit < total };
}

export async function updateItemStatus(
  itemId: string,
  sellerId: string,
  status: "available" | "sold",
) {
  const item = await itemsRepo.updateStatus(itemId, sellerId, status);
  if (!item) throw new HttpError(404, "Item not found");
  return item;
}

export async function getSellerStats(sellerId: string) {
  return itemsRepo.sumSellerMetrics(sellerId);
}
