export const sellerStatusValues = ["none", "pending", "approved"] as const;
export type SellerStatus = (typeof sellerStatusValues)[number];

export const userRoleValues = ["user", "admin"] as const;
export type UserRole = (typeof userRoleValues)[number];

export const itemCondition = ["New with tags", "Like new", "Good", "Fair"] as const;

export const itemStatus = ["available", "sold"] as const;
export type ItemStatus = (typeof itemStatus)[number];

export const orderStatus = ["processing", "in_transit", "delivered", "cancelled"] as const;

export const paymentMethods = ["wave", "orange_money", "free_money", "cash"] as const;

export const carriers = ["Wave Express", "DHL Sénégal", "Sahel Logistique"] as const;

export type OrderStatus = (typeof orderStatus)[number];
export type PaymentMethod = (typeof paymentMethods)[number];
export type Carrier = (typeof carriers)[number];
