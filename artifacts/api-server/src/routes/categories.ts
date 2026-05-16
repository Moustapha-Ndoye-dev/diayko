import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CATEGORIES = [
  { id: "all", label: "All", icon: "grid" },
  { id: "women", label: "Women", icon: "heart" },
  { id: "men", label: "Men", icon: "briefcase" },
  { id: "kids", label: "Kids", icon: "smile" },
  { id: "shoes", label: "Shoes", icon: "shopping-bag" },
  { id: "bags", label: "Bags", icon: "package" },
  { id: "accessories", label: "Accessories", icon: "watch" },
  { id: "sport", label: "Sport", icon: "activity" },
];

router.get("/categories", (_req, res) => {
  res.json(CATEGORIES);
});

export default router;
