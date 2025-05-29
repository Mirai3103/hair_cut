import express from "express";
import invoiceController from "../controllers/invoice.controller.js";
const invoiceRouter = express.Router();

invoiceRouter.get("/", ...invoiceController.getInvoices);
invoiceRouter.post("/", ...invoiceController.createInvoice);
invoiceRouter.get("/:id", ...invoiceController.getInvoiceById);
invoiceRouter.delete("/:id", ...invoiceController.deleteInvoice);

export default invoiceRouter; 