import express from "express";
import hairStyleController from "../controllers/hair-style.controller.js";
const hairStyleRouter = express.Router();

hairStyleRouter.get("/", ...hairStyleController.getAllHairStyles);


export default hairStyleRouter;
