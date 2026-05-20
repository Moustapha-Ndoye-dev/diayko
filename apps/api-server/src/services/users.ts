import type { User } from "../repos/users";
import * as usersRepo from "../repos/users";
import { HttpError } from "../middlewares/errorHandler";

/** API responses must never include password hashes. */
export function toPublicUser(row: User): Omit<User, "passwordHash"> {
  const { passwordHash: _, ...rest } = row;
  return rest;
}

export async function getProfile(id: string) {
  const user = await usersRepo.findById(id);
  if (!user) throw new HttpError(404, "User not found");
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  fields: { name?: string; bio?: string | null },
) {
  const user = await usersRepo.updateProfile(userId, fields);
  if (!user) throw new HttpError(404, "User not found");
  return toPublicUser(user);
}

export async function deleteAccount(userId: string) {
  await usersRepo.deleteUserAndSessions(userId);
}
