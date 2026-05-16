import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import itemsRouter from "./items";
import usersRouter from "./users";
import conversationsRouter from "./conversations";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import favoritesRouter from "./favorites";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(itemsRouter);
router.use(usersRouter);
router.use(conversationsRouter);
router.use(categoriesRouter);
router.use(ordersRouter);
router.use(favoritesRouter);

export default router;
