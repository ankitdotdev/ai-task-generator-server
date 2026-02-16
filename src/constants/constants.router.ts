import { Router } from "express";

const constantRouter = Router();

constantRouter.get("/", (_req, res) => {
  return res.status(200).json({ status: "Server is running" });
});
constantRouter.get("/health", (_req, res) => {
  return res.status(200).json({ status: "Server is running healthy" });
});

export default constantRouter;
