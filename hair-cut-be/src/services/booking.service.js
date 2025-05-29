import db from "../database/index.js";
import { z } from "zod";
import authService from "./auth.service.js";


export const bookingSchema = z.object({
    phoneNumber: z.string().min(1),
    appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "appointmentDate must be a valid date",
    }),
    serviceIds: z.array(z.number().int().positive()).min(1),
    notes: z.string().optional(),
    employeeId: z.number().optional(),
    status: z.string().optional(),
});

export const updateBookingSchema = bookingSchema.partial();

 async function createBooking(req, res) {
   const { phoneNumber, appointmentDate, serviceIds, notes } =
				req.body;
			const user = await authService.getUserByPhoneOrCreate(phoneNumber);
			if (!user)
				throw new Error("User not found or could not be created");
			const allServices = await db.service.findMany({
				where: { id: { in: serviceIds } },
			});
			const totalPrice = allServices.reduce((acc, service) => {
				return acc + Number(service.price);
			}, 0);
			const booking = await db.booking.create({
				data: {
					customerId: user.id,
					appointmentDate: new Date(appointmentDate),
					employeeId: req.body.employeeId,
					notes,
					status: "pending",
					totalPrice,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});
			await db.bookingService.createMany({
				data: serviceIds.map((serviceId) => ({
					bookingId: booking.id,
					serviceId,
				})),
			});

			return booking;
}

export default {

    createBooking,
    bookingSchema,
    updateBookingSchema,
};