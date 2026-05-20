import * as repo from "../repos/notifications";
import { HttpError } from "../middlewares/errorHandler";

export async function listNotifications(userId: string) {
  await repo.ensureSampleNotifications(userId);
  const notifications = await repo.listForUser(userId);
  return { notifications };
}

export async function createNotification(data: {
  userId: string;
  title: string;
  body: string;
}) {
  return repo.createNotification(data);
}

export async function markNotificationRead(notificationId: string, userId: string) {
  const row = await repo.markRead(notificationId, userId);
  if (!row) throw new HttpError(404, "Notification not found");
  return row;
}

export async function markAllNotificationsRead(userId: string) {
  await repo.ensureSampleNotifications(userId);
  await repo.markAllRead(userId);
  return { unread: 0 };
}
