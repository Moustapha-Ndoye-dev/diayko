import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import adminRouter from "./admin";
import itemsRouter from "./items";
import usersRouter from "./users";
import conversationsRouter from "./conversations";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import favoritesRouter from "./favorites";
import walletRouter from "./wallet";
import notificationsRouter from "./notifications";
import platformRouter from "./platform";
import sellerRouter from "./seller";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(itemsRouter);
router.use(usersRouter);
router.use(conversationsRouter);
router.use(categoriesRouter);
router.use(ordersRouter);
router.use(favoritesRouter);
router.use(walletRouter);
router.use(notificationsRouter);
router.use(platformRouter);
router.use(sellerRouter);

export default router;
