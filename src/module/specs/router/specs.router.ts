import { Router } from "express";
import SpecsController from "../controller/specs.controller";
import AuthMiddleware from "../../../middleware/authMiddleware";

const specsRouter = Router();

specsRouter.use(AuthMiddleware.validateToken);
specsRouter.use(AuthMiddleware.checkUserExists);
specsRouter.get("/", SpecsController.getSpecsList);
specsRouter.post("/", SpecsController.generateSpecs);
specsRouter.patch("/:id", SpecsController.updateSpecs);

export default specsRouter;
