import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whopRouter from "./whop";
import adminRouter from "./admin";
import pricingRouter from "./pricing";
import authRouter from "./auth";
import applicationsRouter from "./applications";
import vendorRouter from "./vendor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(whopRouter);
router.use(adminRouter);
router.use(pricingRouter);
router.use(applicationsRouter);
router.use(vendorRouter);

export default router;
