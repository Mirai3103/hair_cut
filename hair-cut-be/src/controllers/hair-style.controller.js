import db from "../database/index.js";

const getAllHairStyles = async (req, res) => {
    try {
        const hairStyles = await db.hairStyle.findMany({
            orderBy: { name: "asc" },
        });
        return res.status(200).json({
            data: hairStyles,
            meta: {
                total: hairStyles.length,
                page: 1,
                size: hairStyles.length
            }
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch hair styles" });
    }
}

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
}

export default {
    getAllHairStyles: [getAllHairStyles],
    getHairStyleById: [getHairStyleById]
};