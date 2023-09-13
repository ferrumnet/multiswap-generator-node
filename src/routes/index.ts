import { Router } from "express";
import userRoute from "./user.route";
import securityKeyRoute from "./securityKey.route";
import jobRoute from "./job.route";

const router = Router();

const defaultRoutes = [
  {
    path: "/user",
    route: userRoute,
  },

  {
    path: "/securityKey",
    route: securityKeyRoute,
  },
  {
    path: "/jobs",
    route: jobRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
