import { z } from "zod";
import { bookingSchema } from "../services/booking.service.js";
import { processRequestBody } from "zod-express-middleware";
import db from "../database/index.js";
import bookingService from "../services/booking.service.js";
import { processRequestQuery } from "zod-express-middleware";
import { processRequestParams } from "zod-express-middleware";
import PDFDocument from 'pdfkit';
import path from 'path';

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
        if (invoice.status !== 'cancelled') {
            return res.status(400).json({ error: "Only cancelled invoices can be deleted" });
        }
        await db.invoice.delete({
            where: { id: Number(id) },
        });
        return res.status(204).send();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

const changeInvoiceStatus = [
	processRequestBody(
		z.object({
			status: z.enum([
				"pending",
				"confirmed",
				"cancelled",
				"in_progress",
				"completed",
				"success",
			]),
		})
	),
	async (req, res) => {
		const id = Number(req.params.id);
		if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

		try {
			const updated = await db.invoice.update({
				where: { id },
				data: {
					status: req.body.status,
				},
			});
		
			return res.json(updated);
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	},
];

const exportInvoicePdf = async (req, res) => {
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
 
		const doc = new PDFDocument({ margin: 40, size: 'A4' });
		const dirname = path.resolve();
		const fontPath = path.join(dirname, '/src/assets');
		
		doc.registerFont('Roboto-Regular', path.join(fontPath, 'Roboto-Regular.ttf'));
		doc.registerFont('Roboto-Bold', path.join(fontPath, 'Roboto-Bold.ttf'));
 
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename=hoa-don-${invoice.id}.pdf`);
		doc.pipe(res);
 
		const pageWidth = doc.page.width - 80;
		const leftColumn = 40;
		const rightColumn = 320;
 
		// Invoice title and number
		doc.font('Roboto-Bold').fontSize(28).text('HÓA ĐƠN', leftColumn, 60, {
			width: pageWidth,
			align: 'center'
		});
		
		// Invoice details box
		const invoiceBoxTop = 100;
		doc.rect(rightColumn, invoiceBoxTop, 200, 80).stroke();
		
		doc.font('Roboto-Bold').fontSize(12).text('Số hóa đơn:', rightColumn + 10, invoiceBoxTop + 15);
		doc.font('Roboto-Regular').text(`#${String(invoice.id).padStart(6, '0')}`, rightColumn + 110, invoiceBoxTop + 15);
		
		doc.font('Roboto-Bold').text('Ngày lập:', rightColumn + 10, invoiceBoxTop + 35);
		doc.font('Roboto-Regular').text(invoice.invoiceDate.toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}), rightColumn + 110, invoiceBoxTop + 35);
		
		doc.font('Roboto-Bold').text('Trạng thái:', rightColumn + 10, invoiceBoxTop + 55);
		const statusTranslation = {
			pending: 'ĐANG CHỜ',
			confirmed: 'ĐÃ XÁC NHẬN',
			cancelled: 'ĐÃ HỦY',
			in_progress: 'ĐANG THỰC HIỆN',
			completed: 'HOÀN THÀNH',
			success: 'THÀNH CÔNG'
		};
		doc.font('Roboto-Regular').text(statusTranslation[invoice.status] || invoice.status.toUpperCase(), rightColumn + 110, invoiceBoxTop + 55);
 
		// Horizontal line separator
		doc.moveTo(leftColumn, 200).lineTo(leftColumn + pageWidth, 200).stroke();
 
		// Billing information
		doc.font('Roboto-Bold').fontSize(14).text('THÔNG TIN KHÁCH HÀNG:', leftColumn, 220);
		doc.font('Roboto-Regular').fontSize(12)
			.text(invoice.booking.customer.fullName, leftColumn, 245)
			.text(`Điện thoại: ${invoice.booking.customer.phone}`, leftColumn, 265)
			.text(`Email: ${invoice.booking.customer.email}`, leftColumn, 285);
 
		// Appointment details
		doc.font('Roboto-Bold').fontSize(14).text('CHI TIẾT LỊCH HẸN:', rightColumn, 220);
		doc.font('Roboto-Regular').fontSize(12)
			.text(`Ngày: ${invoice.booking.appointmentDate.toLocaleDateString('vi-VN', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}`, rightColumn, 245)
			.text(`Giờ: ${invoice.booking.appointmentDate.toLocaleTimeString('vi-VN', {
				hour: '2-digit',
				minute: '2-digit'
			})}`, rightColumn, 265);
 
		if (invoice.booking.employee) {
			doc.text(`Thợ cắt: ${invoice.booking.employee.fullName}`, rightColumn, 285);
		}
 
		// Services table
		const tableTop = 330;
		const tableHeaders = ['Dịch vụ', 'Thời gian', 'Giá'];
		const columnWidths = [280, 120, 120];
		const columnPositions = [leftColumn, leftColumn + 280, leftColumn + 400];
 
		// Table header
		doc.rect(leftColumn, tableTop, pageWidth, 25).fill('#f0f0f0').stroke();
		
		doc.fillColor('#000000').font('Roboto-Bold').fontSize(12);
		tableHeaders.forEach((header, i) => {
			doc.text(header, columnPositions[i] + 10, tableTop + 8);
		});
 
		// Table rows
		let currentY = tableTop + 25;
		doc.font('Roboto-Regular').fontSize(11);
 
		invoice.booking.services.forEach((serviceItem, index) => {
			const rowHeight = 30;
			
			if (index % 2 === 1) {
				doc.rect(leftColumn, currentY, pageWidth, rowHeight).fill('#f9f9f9').stroke();
			} else {
				doc.rect(leftColumn, currentY, pageWidth, rowHeight).stroke();
			}
 
			doc.fillColor('#000000')
				.text(serviceItem.service.serviceName, columnPositions[0] + 10, currentY + 10)
				.text(`${serviceItem.service.estimatedTime} phút`, columnPositions[1] + 10, currentY + 10)
				.text(`${serviceItem.service.price.toLocaleString()}đ`, columnPositions[2] + 10, currentY + 10);
 
			currentY += rowHeight;
		});
 
		// Totals section
		const totalsTop = currentY + 30;
		const totalsRight = leftColumn + pageWidth - 250; // Made wider
 
		doc.rect(totalsRight, totalsTop, 250, 50).stroke(); // Made taller and wider
 
		doc.font('Roboto-Bold').fontSize(18); // Increased font size
		doc.text('TỔNG CỘNG:', totalsRight + 20, totalsTop + 17);
		const total = invoice.booking.services.reduce((sum, item) => sum + parseFloat(item.service.price.toString()), 0);
		doc.text(`${total.toLocaleString()}đ`, totalsRight + 150, totalsTop + 17);
 
		// Footer
		const footerY = doc.page.height - 50;
		doc.moveTo(leftColumn, footerY - 20).lineTo(leftColumn + pageWidth, footerY - 20).stroke();
		
		doc.font('Roboto-Regular').fontSize(10)
			.text('Cảm ơn quý khách đã sử dụng dịch vụ của Premium Barbershop!', leftColumn, footerY, {
				width: pageWidth,
				align: 'center'
			});
 
		doc.end();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: err.message });
	}
};

// Helper function for status colors
const getStatusColor = (status) => {
    const statusColors = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        cancelled: '#ef4444',
        in_progress: '#8b5cf6',
        completed: '#10b981',
        success: '#059669'
    };
    return statusColors[status] || '#6b7280';
};


export default {
	createInvoice,
	getInvoices,
    getInvoiceById: [getInvoiceById],
    deleteInvoice: [deleteInvoice],
	changeInvoiceStatus: [changeInvoiceStatus],
    exportInvoicePdf: [exportInvoicePdf],
};
