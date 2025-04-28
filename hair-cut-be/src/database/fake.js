import { faker } from "@faker-js/faker/locale/vi";
import { PrismaClient } from "./generated";

const db = new PrismaClient();

// gen customer

await db.user.deleteMany({});
const admin = await db.user.create({
	data: {
		email: "admin@admin.com",
		phone: "admin",
		fullName: "admin",
		role: "admin",
		availabilityStatus: "available",
		status: "active",
		password: "admin",
		createdAt: faker.date.past({}),
	},
});
const baberId = [];
const customerId = [];
for (let i = 0; i < 20; i++) {
	const user = await db.user.create({
		data: {
			email: faker.internet.email(),
			password: "Password",
			fullName: faker.person.fullName(),
			phone: faker.helpers.fromRegExp(/(0[3|5|7|8|9])+([0-9]{8})/),
			address: faker.address.streetAddress(),
			role: "customer",
			availabilityStatus: "available",
			birthDate: faker.date.past({}),

			CCCD: faker.helpers.fromRegExp(
				/^(0[0-9]{2}|1[0-9]{2}|2[0-9]{2})[0-9][0-9]{2}[0-9]{6}/
			),
			gender: faker.helpers.arrayElement([true, false]),
			createdAt: faker.date.past({}),
			status: "active",
		},
	});
	customerId.push(user.id);
}

for (let i = 0; i < 10; i++) {
	const user = await db.user.create({
		data: {
			email: faker.internet.email(),
			password: "Password",
			fullName: faker.person.fullName(),
			phone: faker.helpers.fromRegExp(/(0[3|5|7|8|9])+([0-9]{8})/),
			address: faker.address.streetAddress(),
			role: "barber",
			availabilityStatus: "available",
			birthDate: faker.date.past({}),

			CCCD: faker.helpers.fromRegExp(
				/^(0[0-9]{2}|1[0-9]{2}|2[0-9]{2})[0-9][0-9]{2}[0-9]{6}/
			),
			gender: faker.helpers.arrayElement([true, false]),
			createdAt: faker.date.past({}),
			status: "active",
		},
	});
	baberId.push(user.id);
}

for (let i = 0; i < 2; i++) {
	const user = await db.user.create({
		data: {
			email: faker.internet.email(),
			password: "Password",
			fullName: faker.person.fullName(),
			phone: faker.helpers.fromRegExp(/(0[3|5|7|8|9])+([0-9]{8})/),
			address: faker.address.streetAddress(),
			role: "receptionist",
			availabilityStatus: "available",
			birthDate: faker.date.past({}),

			CCCD: faker.helpers.fromRegExp(
				/^(0[0-9]{2}|1[0-9]{2}|2[0-9]{2})[0-9][0-9]{2}[0-9]{6}/
			),
			gender: faker.helpers.arrayElement([true, false]),
			createdAt: faker.date.past({}),
			status: "active",
		},
	});
}

// fake customer booking
const service = await db.service.findMany({});

for await (const customer of customerId) {
	const numberOfBookings = faker.number.int({ min: 1, max: 5 });

	for (let i = 0; i < numberOfBookings; i++) {
		const booking = await db.booking.create({
			data: {
				appointmentDate: faker.date.past({
					years: 1,
				}),
				createdAt: faker.date.past({
					years: 1,
				}),
				customer: {
					connect: {
						id: customer,
					},
				},
				employee: {
					connect: {
						id: faker.helpers.arrayElement(baberId),
					},
				},
				notes: faker.lorem.paragraph(),
			},
		});
	}
}
