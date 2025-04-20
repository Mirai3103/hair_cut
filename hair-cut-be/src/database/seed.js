import { PrismaClient } from "./generated/client";
import fs from "fs";
const db = new PrismaClient();
const dataFilePath = process.cwd() + "/src/database/data.json";

const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

// "name": "CẮT TÓC KHOANG THƯƠNG GIA",
// "banner": "https://storage.30shine.com/web/v4/images/cat-goi-combo/CutThuongGia/banner.png",
// "des": "Dịch vụ Cắt Tóc Khoang Thương Gia - Mang đến trải nghiệm dịch vụ đỉnh cao lần\nđầu tiên xuất hiện tại Việt Nam",
// "time": "75",

for await (const sv of data) {
	const service = await db.service.create({
		data: {
			estimatedTime: Number(sv.time),
			serviceName: sv.name,
			price: Number(sv.price),
			description: sv.des,
			bannerImageUrl: sv.banner,
			createdAt: new Date(),
		},
	});

	const serviceStep = sv.stepNames.map((step, index) => {
		return {
			stepTitle: step,
			serviceId: service.id,
			stepOrder: index + 1,
			stepDescription: "",
			stepImageUrl: sv.stepImgs[index],
		};
	});

	await db.serviceStep.createMany({
		data: serviceStep,
	});
	console.log("Created service:", service.serviceName);
}
