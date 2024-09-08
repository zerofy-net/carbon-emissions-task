import { Router } from "express";
import health from "./routes/health.js";
import emissions from "./routes/emissions.js";

const routes = Router();

routes.use("/health", health);
routes.use("/emissions", emissions);

export default routes;
