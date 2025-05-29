import db from "src/database";


const getAllHairStyles = async (req, res) => {
    try {
        const hairStyles = await db.hairStyle.findMany({
            orderBy: { name: "asc" },
        });
        return res.status(200).json(hairStyles);
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch hair styles" });
    }
}

export default {
    getAllHairStyles:[getAllHairStyles]
};