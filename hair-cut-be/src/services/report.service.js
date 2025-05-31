import db from "../database/index.js";
import { Status } from "../database/generated/index.js";

function buildInvoiceWhere(filters = {}) {
	const { from, to, year, employeeId } = filters;
	const where = {
		status: Status.success,
	};

	if (year) {
		where.invoiceDate = {
			gte: new Date(`${year}-01-01`),
			lte: new Date(`${year}-12-31`),
		};
	} else if (from && to) {
		where.invoiceDate = {
			gte: new Date(from),
			lte: new Date(to),
		};
	}

	if (employeeId) {
		where.booking = {
			employeeId: Number(employeeId),
		};
	}

	return where;
}

async function getMonthlyRevenueTable(filters = {}) {
	const where = buildInvoiceWhere(filters);

	const invoices = await db.invoice.findMany({
		where,
		select: {
			invoiceDate: true,
			totalAmount: true,
		},
	});

	const map = new Map();

	invoices.forEach(({ invoiceDate, totalAmount }) => {
		const date = new Date(invoiceDate);
		const month = `${date.getFullYear()}-${(date.getMonth() + 1)
			.toString()
			.padStart(2, "0")}`;

		if (!map.has(month)) {
			map.set(month, { count: 0, total: 0 });
		}

		const entry = map.get(month);
		entry.count++;
		entry.total += Number(totalAmount ?? 0);
	});

	// Sort by month
	return Array.from(map.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([month, { count, total }]) => ({
			month,
			total,
			count,
		}));
}

// 💈 Bảng doanh thu theo dịch vụ
async function getRevenueByServiceTable(filters = {}) {
	const where = buildInvoiceWhere(filters);

	// Get successful invoices and their related booking services
	const successfulInvoices = await db.invoice.findMany({
		where,
		include: {
			booking: {
				include: {
					services: {
						include: {
							service: {
								select: { id: true, serviceName: true },
							},
						},
					},
				},
			},
		},
	});

	const map = new Map();

	for (const invoice of successfulInvoices) {
		const serviceCount = invoice.booking.services.length;
		if (serviceCount === 0) continue;

		// Calculate portion per service based on invoice total amount
		const portion = Number(invoice.totalAmount) / serviceCount;

		for (const bookingService of invoice.booking.services) {
			// Skip if service ID filter is applied and doesn't match
			if (
				filters.serviceId &&
				bookingService.service.id !== Number(filters.serviceId)
			) {
				continue;
			}

			const serviceName =
				bookingService.service?.serviceName || "Unknown";

			if (!map.has(serviceName)) {
				map.set(serviceName, { count: 0, total: 0 });
			}

			const entry = map.get(serviceName);
			entry.count++;
			entry.total += portion;
		}
	}

	return Array.from(map.entries())
		.sort((a, b) => b[1].total - a[1].total)
		.map(([name, { total, count }]) => ({
			service: name,
			count,
			total,
		}));
}

export default {
	getMonthlyRevenueTable,
	getRevenueByServiceTable,
};
