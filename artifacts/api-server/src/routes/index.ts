import { Router, type IRouter } from "express";
import healthRouter from "./health";
import itemsRouter from "./items";
import usersRouter from "./users";
import conversationsRouter from "./conversations";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(itemsRouter);
router.use(usersRouter);
router.use(conversationsRouter);
router.use(categoriesRouter);

export default router;
