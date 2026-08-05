import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import itemsRouter from "./items";
import dashboardRouter from "./dashboard";
import statsRouter from "./stats";
import adminRouter from "./admin";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(itemsRouter);
router.use(dashboardRouter);
router.use(statsRouter);
router.use(adminRouter);
router.use(uploadRouter);

export default router;
