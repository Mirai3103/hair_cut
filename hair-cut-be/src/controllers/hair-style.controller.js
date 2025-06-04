import { processRequestBody } from "zod-express-middleware";
import db from "../database/index.js";
import z from "zod";

const hairStyleSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
});

const updateHairStyleSchema = hairStyleSchema.partial();

const querySchema = z.object({
    keyword: z.string().optional(),
    page: z.coerce.number().min(1).optional(),
    size: z.coerce.number().min(1).max(20000).optional(),
});

const getAllHairStyles = async (req, res) => {
    try {
        const {
            keyword,
            page = 1,
            size = 20
        } = querySchema.parse(req.query);
        
        const where = keyword ? { name: { contains: keyword } } : {};

        const [hairStyles, total] = await Promise.all([
            db.hairStyle.findMany({
                where,
                orderBy: {name:"asc"},
                skip: (page - 1) * size,
                take: size,
            }),
            db.hairStyle.count({ where }),
        ]);

        return res.status(200).json({
            data: hairStyles,
            meta: {
                total,
                page,
                size
            }
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch hair styles" });
    }
};

const getHairStyleById = async (req, res) => {
    try {
        const { id } = req.params;
        const hairStyle = await db.hairStyle.findUnique({
            where: { id: parseInt(id) }
        });

        if (!hairStyle) {
            return res.status(404).json({ error: "Hair style not found" });
        }

        return res.status(200).json(hairStyle);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch hair style" });
    }
};

const createHairStyle = [
    processRequestBody(hairStyleSchema),
    async (req, res) => {
        const { name, description, imageUrl } = req.body;
        try {
            const created = await db.hairStyle.create({
                data: {
                    name,
                    description,
                    imageUrl,
                },
            });
            return res.status(201).json(created);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },
];

const updateHairStyle = [
    processRequestBody(updateHairStyleSchema),
    async (req, res) => {
        const id = Number(req.params.id);
        try {
            const updated = await db.hairStyle.update({
                where: { id },
                data: {
                    ...req.body,
                },
            });
            return res.json(updated);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },
];

const deleteHairStyle = async (req, res) => {
    const id = Number(req.params.id);
    try {
        await db.hairStyle.delete({ where: { id } });
        return res.status(204).end();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export default {
    getAllHairStyles: [getAllHairStyles],
    getHairStyleById: [getHairStyleById],
    createHairStyle,
    updateHairStyle,
    deleteHairStyle: [deleteHairStyle],
};