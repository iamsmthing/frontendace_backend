"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsComplete = exports.deleteChallenge = exports.getChallengeById = exports.getChallenges = exports.bulkCreateChallenges = exports.createChallenge = void 0;
const drizzle_1 = require("../db/drizzle");
const schema_1 = require("../db/schema/schema");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const difficultyScores = {
    "Easy": 10,
    "Medium": 20,
    "Hard": 30,
};
const createChallenge = async (req, res) => {
    try {
        const { title, difficulty, category, description, hints } = req.body;
        const score = difficultyScores[difficulty] || 0;
        const newChallenge = await drizzle_1.db.insert(schema_1.challenges).values({ id: (0, uuid_1.v4)(), title, difficulty, category, description, hints, score }).returning();
        return res.json(newChallenge);
    }
    catch (error) {
        return res.json({ error: error });
    }
};
exports.createChallenge = createChallenge;
// Bulk create challenges with dynamic category
const bulkCreateChallenges = async (req, res) => {
    try {
        const challengeData = req.body; // Expect an array of challenges in request body
        // Validate input data
        if (!Array.isArray(challengeData) || challengeData.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty input data' });
        }
        // Map data and assign a unique ID for each challenge
        const data = challengeData.map((challenge) => ({
            id: (0, uuid_1.v4)(),
            title: challenge.title,
            difficulty: challenge.difficulty,
            category: challenge.category,
            description: challenge.description,
            hints: challenge.hints,
            score: difficultyScores[challenge.difficulty] || 0
        }));
        // Insert all challenges at once
        const newChallenges = await drizzle_1.db.insert(schema_1.challenges).values(data).returning();
        return res.json(newChallenges);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create challenges' });
    }
};
exports.bulkCreateChallenges = bulkCreateChallenges;
const getChallenges = async (req, res) => {
    try {
        const allChallenges = await drizzle_1.db.select().from(schema_1.challenges).orderBy(schema_1.challenges.category);
        return res.json({ problems: allChallenges });
    }
    catch (error) {
        return res.json({ error: 'Failed to get challenges' });
    }
};
exports.getChallenges = getChallenges;
const getChallengeById = async (req, res) => {
    var _a;
    try {
        const id = req.query.id; // Get ID from route parameters
        const { userId } = req.body;
        // console.log(userId);
        // Validate userId
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        // Query the database to find the challenge by ID
        if (!id) {
            return res.status(400).json({ error: "ID is required as a query parameter." });
        }
        const challengeWithProgress = await drizzle_1.db.query.challenges.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.challenges.id, id),
            with: {
                progress: {
                    where: (0, drizzle_orm_1.eq)(schema_1.userProgress.userId, userId)
                }
            }
        });
        // Check if the challenge exists
        if (!challengeWithProgress) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        // Determine if the challenge is completed based on progress data
        const progress = (_a = challengeWithProgress.progress) === null || _a === void 0 ? void 0 : _a[0];
        const isCompleted = (progress === null || progress === void 0 ? void 0 : progress.isCompleted) || false;
        // Return the challenge
        return res.json(challengeWithProgress);
    }
    catch (error) {
        console.error(error); // Log error for debugging
        return res.status(500).json({ error: 'Failed to get the challenge' });
    }
};
exports.getChallengeById = getChallengeById;
// Delete a challenge by ID
const deleteChallenge = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL parameter
        // Check if ID is provided
        if (!id) {
            return res.status(400).json({ error: 'Challenge ID is required' });
        }
        // Delete the challenge
        const deletedChallenge = await drizzle_1.db
            .delete(schema_1.challenges)
            .where((0, drizzle_orm_1.eq)(schema_1.challenges.id, id))
            .returning(); // Return the deleted record (if needed)
        // Check if any record was deleted
        if (deletedChallenge.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        return res.json({ message: 'Challenge deleted successfully', deletedChallenge });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to delete challenge' });
    }
};
exports.deleteChallenge = deleteChallenge;
const markAsComplete = async (req, res) => {
    try {
        const { isCompleted, userId, challengeId } = req.body;
        const existingProgress = await drizzle_1.db.query.userProgress.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userProgress.id, userId), (0, drizzle_orm_1.eq)(schema_1.userProgress.challengeId, challengeId))
        });
        if (existingProgress) {
            const result = await drizzle_1.db.update(schema_1.userProgress).set({
                isCompleted: !existingProgress.isCompleted,
                completedAt: !existingProgress.isCompleted ? new Date() : null,
                updatedAt: new Date()
            }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userProgress.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userProgress.challengeId, challengeId))).returning();
            return res.status(200).json({ result, message: "Challenge updated successfully" });
        }
        else {
            // If no progress exists, create a new entry and mark it as complete
            const result = await drizzle_1.db.insert(schema_1.userProgress).values({
                id: (0, uuid_1.v4)(),
                completedAt: new Date(),
                isCompleted,
                userId,
                challengeId,
                updatedAt: new Date()
            }).returning();
            console.log(result);
            return res.status(200).json({ result, message: "Challenge updated successfully" });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to delete challenge' });
    }
};
exports.markAsComplete = markAsComplete;
