import { z } from "zod";
import { bookingSchema } from "../services/booking.service.js";
import { processRequestBody } from "zod-express-middleware";
import db from "../database/index.js";
import bookingService from "../services/booking.service.js";
import { processRequestQuery } from "zod-express-middleware";
import { processRequestParams } from "zod-express-middleware";

export const invoiceSchema = z.object({
	id: z.number().optional(),
	bookingId: z.number().nullish(),
	invoiceDate: z.date().optional(),
	totalAmount: z.number().default(0.0),
	status: z.string().default("pending"),
	booking: bookingSchema.optional(),
});

const createInvoice = [
	processRequestBody(invoiceSchema),
	async (req, res) => {
		try {
			const { bookingId, invoiceDate, totalAmount, booking } = req.body;
			if (!bookingId && !booking) {
				return res.status(400).json({
					error: "Either bookingId or booking details must be provided",
				});
			}
			let bookingDetails = null;
			if (bookingId) {
				bookingDetails = await db.booking.findUnique({
					where: { id: bookingId },
				});
				if (!bookingDetails) {
					return res.status(404).json({ error: "Booking not found" });
				}
			} else {
				bookingDetails = await bookingService.createBooking(booking);
			}
			const invoice = await db.invoice.create({
				data: {
					invoiceDate: invoiceDate || new Date(),
					totalAmount:
						bookingDetails.totalPrice || totalAmount || 0.0,
					status: "pending",
					booking: {
						connect: { id: bookingDetails.id },
					},
				},
			});
			return res.status(201).json(invoice);
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	},
];

const querySchema = z.object({
	keyword: z.string().optional(),
	page: z.coerce.number().min(1).optional(),
	size: z.coerce.number().min(1).max(20000).optional(),
	sortBy: z.enum(["id", "status", "totalAmount"]).default("id"),
	sortDirection: z.enum(["asc", "desc"]).default("desc"),
	status: z
		.enum([
			"pending",
			"confirmed",
			"cancelled",
			"in_progress",
			"completed",
			"success",
		])
		.optional(),
	dateFrom: z.string().date().optional(),
	dateTo: z.string().date().optional(),
});

const getInvoices = [
	processRequestParams(querySchema),
	async (req, res) => {
		console.log('getting invoices')
		try {
			const {
				keyword,
				page = 1,
				size = 10,
				sortBy = "id",
				sortDirection = "desc",
				status,
				dateFrom,
				dateTo,
			} = req.query;

			// 1. Build WHERE clause
			const where = {};

			if (status) {
				where.status = status;
			}
			if (dateFrom || dateTo) {
				where.invoiceDate = {
					...(dateFrom && { gte: new Date(dateFrom) }),
					...(dateTo && { lte: new Date(dateTo) }),
				};
			}
			if (keyword) {
				where.OR = [
					{ booking: { customer: { phone: { contains: keyword } } } },
					{
						booking: {
							customer: { fullName: { contains: keyword } },
						},
					},
				];
			}

			// 2. Query total count
			const total = await db.invoice.count({ where });

			// 3. Fetch invoices with relations, pagination, and sorting
			const invoices = await db.invoice.findMany({
				where,
				include: {
					booking: {
						include: {
							customer: true,
							employee: true,
							services: {
								include: {
									service: true,
								},
							},
						},
					},
				},
				orderBy: { [sortBy]: sortDirection },
				skip: (page - 1) * size,
				take: Number(size),
			});

			return res.json({
				data: invoices,
				meta: { total, page, size },
			});
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: err.message });
		}
	},
];
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await db.invoice.findUnique({
            where: { id: Number(id) },
            include: {
                booking: {
                    include: {
                        customer: true,
                        employee: true,
                        services: {
                            include: {
                                service: true,
                            },
                        },
                    },
                },
            },
        });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        return res.json(invoice);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await db.invoice.findUnique({
            where: { id: Number(id) },
        });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        await db.invoice.delete({
            where: { id: Number(id) },
        });
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export default {
	createInvoice,
	getInvoices,
    getInvoiceById: [getInvoiceById],
    deleteInvoice: [deleteInvoice],
};
