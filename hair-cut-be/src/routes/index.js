import express from "express";
import serviceRouter from "./service.route.js";
const apiRoute = express.Router();

apiRoute.use("/services", serviceRouter);

export default apiRoute;
