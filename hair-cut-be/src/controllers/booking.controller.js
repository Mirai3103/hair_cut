import { processRequestBody } from "zod-express-middleware";
import db from "../database/index.js";
import z from "zod";

// Status enum có thể là "pending", "confirmed", "cancelled", etc.
const bookingSchema = z.object({
	customerId: z.number().int().positive(),
	employeeId: z.number().int().positive().optional(),
	appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: "appointmentDate must be a valid date",
	}),
	serviceIds: z.array(z.number().int().positive()).optional(),
	status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
	totalPrice: z.number().nonnegative().default(0),
	notes: z.string().optional(),
});

const updateBookingSchema = bookingSchema.partial();

const createBooking = [
	processRequestBody(bookingSchema),
	async (req, res) => {
		try {
			const {
				customerId,
				employeeId,
				appointmentDate,
				status,
				totalPrice,
				notes,
			} = req.body;

			const booking = await db.booking.create({
				data: {
					customerId,
					employeeId,
					appointmentDate: new Date(appointmentDate),
					status,
					totalPrice,
					notes,
					createdAt: new Date(),
					updatedAt: new Date(),
					services: {
						connect: req.body.serviceIds?.map((id) => ({ id })),
					},
				},
			});

			return res.status(201).json(booking);
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	},
];

const getBookings = async (req, res) => {
	try {
		const bookings = await db.booking.findMany({
			include: {
				customer: true,
				employee: true,
				services: true,
			},
		});
		return res.json(bookings);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

const getBookingById = async (req, res) => {
	const id = Number(req.params.id);
	if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

	try {
		const booking = await db.booking.findUnique({
			where: { id },
			include: {
				customer: true,
				employee: true,
				services: true,
			},
		});

		if (!booking) return res.status(404).json({ message: "Not found" });
		return res.json(booking);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

const updateBooking = [
	processRequestBody(updateBookingSchema),
	async (req, res) => {
		const id = Number(req.params.id);
		if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

		try {
			const data = Object.fromEntries(
				Object.entries(req.body).filter(([_, v]) => v !== undefined)
			);

			if (data.appointmentDate)
				data.appointmentDate = new Date(data.appointmentDate);

			const updated = await db.booking.update({
				where: { id },
				data,
			});

			return res.json(updated);
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	},
];

const deleteBooking = async (req, res) => {
	const id = Number(req.params.id);
	if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

	try {
		await db.booking.delete({ where: { id } });
		return res.status(204).end();
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
};

export default {
	createBooking,
	getBookings: [getBookings],
	getBookingById: [getBookingById],
	updateBooking,
	deleteBooking: [deleteBooking],
};
