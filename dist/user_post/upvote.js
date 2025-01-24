"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUpvote = void 0;
const drizzle_1 = require("../db/drizzle");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const toggleUpvote = async (req, res) => {
    try {
        const { userId, postId } = req.body;
        const existingUpvote = await drizzle_1.db.query.upvotes.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.upvotes.userId, userId), (0, drizzle_orm_1.eq)(schema_1.upvotes.postId, postId))
        });
        if (existingUpvote) {
            // Remove upvote
            await drizzle_1.db.delete(schema_1.upvotes).where((0, drizzle_orm_1.eq)(schema_1.upvotes.id, existingUpvote.id));
            return res.status(200).json({ message: "Upvote removed" });
        }
        // Add upvote
        const newUpvote = await drizzle_1.db.insert(schema_1.upvotes).values({ id: (0, uuid_1.v4)(), userId, postId }).returning();
        return res.status(201).json(newUpvote);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to toggle upvote" });
    }
};
exports.toggleUpvote = toggleUpvote;
