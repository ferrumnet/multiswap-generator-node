import { Router } from "express";
import { userController } from "../controllers";
import auth from "../middlewares/auth.middleware";
const router = Router();

router.route("/").get(auth(), userController.getUser);
export default router;
