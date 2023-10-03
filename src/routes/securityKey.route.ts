import { Router } from "express";
import { securityKeyController } from "../controllers";
import auth from "../middlewares/auth.middleware";
const router = Router();

router.route("/").post(auth(), securityKeyController.setSecurityKey);
router.route("/do/encryption").post(securityKeyController.doEncryption);
export default router;
