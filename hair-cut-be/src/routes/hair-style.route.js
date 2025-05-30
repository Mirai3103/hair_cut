import express from "express";
import hairStyleController from "../controllers/hair-style.controller.js";
const hairStyleRouter = express.Router();

hairStyleRouter.get("/", ...hairStyleController.getAllHairStyles);
hairStyleRouter.get("/:id", ...hairStyleController.getHairStyleById);

export default hairStyleRouter;
