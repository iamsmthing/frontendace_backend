"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProblemsWithCompletionStatus = exports.markAsComplete = void 0;
const drizzle_1 = require("../db/drizzle");
const schema_1 = require("../db/schema/schema");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const markAsComplete = async (req, res) => {
    try {
        const { userId, challengeId, isCompleted, } = req.body;
        // Validate the inputs
        if (!userId || !challengeId || typeof isCompleted !== "boolean") {
            return res.status(400).json({ message: "Invalid input data" });
        }
        // check if progress already exists
        const existingProgress = await drizzle_1.db.select().from(schema_1.userProgress).where((0, drizzle_orm_1.eq)(schema_1.userProgress.id, userId) && (0, drizzle_orm_1.eq)(schema_1.userProgress.challengeId, challengeId));
        // if progress already exists, then update it
        if (existingProgress.length > 0) {
            await drizzle_1.db.update(schema_1.userProgress).set({ isCompleted, completedAt: isCompleted ? new Date() : null, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.userProgress.userId, userId) && (0, drizzle_orm_1.eq)(schema_1.userProgress.challengeId, challengeId));
            return res.status(200).json({ message: 'Challenge updated successfully' });
        }
        // if progress does not exist
        await drizzle_1.db.insert(schema_1.userProgress).values({ id: (0, uuid_1.v4)(), userId, challengeId, isCompleted, completedAt: isCompleted ? new Date() : null, updatedAt: new Date() });
        return res.status(200).json({ message: "challenge marked as complete" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.markAsComplete = markAsComplete;
const getAllProblemsWithCompletionStatus = async (req, res) => {
    try {
        const { userID } = req.body;
        if (!userID) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        // Fetch all problems with user's progress using relation mapping
        const problems = await drizzle_1.db.query.challenges.findMany({
            with: {
                progress: {
                    where: (0, drizzle_orm_1.eq)(schema_1.userProgress.userId, userID)
                }
            }
        });
        return res.status(200).json({ problems });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllProblemsWithCompletionStatus = getAllProblemsWithCompletionStatus;
