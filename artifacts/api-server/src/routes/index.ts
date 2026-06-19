import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whopRouter from "./whop";
import adminRouter from "./admin";
import pricingRouter from "./pricing";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whopRouter);
router.use(adminRouter);
router.use(pricingRouter);

export default router;
