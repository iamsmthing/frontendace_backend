"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPeerReview = exports.getPendingPeerReviewById = exports.getChallengeReviewsOfUser = exports.getPendingPeerReviews = exports.submitChallengeForReview = void 0;
const drizzle_1 = require("../db/drizzle");
const schema_1 = require("../db/schema/schema");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
require("dotenv/config");
const post_1 = require("../user_post/post");
const submitChallengeForReview = async (req, res) => {
    try {
        const { userId, challengeId, code, imageUrl } = req.body;
        const submitChallenge = await drizzle_1.db
            .insert(schema_1.userProgress)
            .values({
            id: (0, uuid_1.v4)(),
            userId,
            challengeId,
            code,
            imageUrl,
            isCompleted: false,
        })
            .returning();
        if (submitChallenge.length > 0) {
            return res.status(201).json({
                message: "Challenge submitted successfully",
                data: submitChallenge[0],
            });
        }
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to create post", err: error });
    }
};
exports.submitChallengeForReview = submitChallengeForReview;
const getPendingPeerReviews = async (req, res) => {
    try {
        const tokenUserId = (0, post_1.extractUserId)(req, res);
        const challenges = await drizzle_1.db.query.userProgress.findMany({
            with: {
                challenge: true,
                user: { columns: { username: true, imageUrl: true } },
                peerReviews: {
                    with: {
                        reviewer: { columns: { username: true, imageUrl: true } },
                    },
                },
            },
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userProgress.isCompleted, false), (0, drizzle_orm_1.not)((0, drizzle_orm_1.eq)(schema_1.userProgress.userId, tokenUserId))),
        });
        if (challenges.length > 0) {
            return res.status(201).json(challenges);
        }
        return res.json(challenges);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to create post", err: error });
    }
};
exports.getPendingPeerReviews = getPendingPeerReviews;
const getChallengeReviewsOfUser = async (req, res) => {
    try {
        const tokenUserId = (0, post_1.extractUserId)(req, res);
        const challenges = await drizzle_1.db.query.userProgress.findMany({
            with: {
                challenge: true,
                user: { columns: { username: true, imageUrl: true } },
                peerReviews: {
                    with: {
                        reviewer: { columns: { username: true, imageUrl: true } },
                    },
                },
            },
            where: (0, drizzle_orm_1.eq)(schema_1.userProgress.userId, tokenUserId),
        });
        if (challenges.length > 0) {
            return res.status(201).json(challenges);
        }
        return res.json(challenges);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fech reviews of challenges", err: error });
    }
};
exports.getChallengeReviewsOfUser = getChallengeReviewsOfUser;
const getPendingPeerReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await drizzle_1.db.query.userProgress.findFirst({
            with: {
                challenge: true,
                user: { columns: { username: true, imageUrl: true } },
                peerReviews: {
                    with: {
                        reviewer: { columns: { username: true, imageUrl: true } },
                    },
                },
            },
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userProgress.isCompleted, false), (0, drizzle_orm_1.eq)(schema_1.userProgress.id, id)),
        });
        if (challenge) {
            return res.status(201).json(challenge);
        }
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: "Failed to fetch pending review", err: error });
    }
};
exports.getPendingPeerReviewById = getPendingPeerReviewById;
const submitPeerReview = async (req, res) => {
    try {
        const { reviewerId, userProgressId, challengeId, comment, isApproved } = req.body;
        // Fetch the user who submitted this challenge
        const challengeSubmission = await drizzle_1.db.query.userProgress.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.userProgress.id, userProgressId),
            columns: { userId: true } // Fetch only the userId
        });
        if (!challengeSubmission) {
            return res.status(404).json({ error: "Challenge submission not found." });
        }
        // Prevent users from approving their own challenge
        if (challengeSubmission.userId === reviewerId) {
            return res.status(403).json({ error: "You cannot approve your own challenge." });
        }
        //check if the reviewer has already reviewed the challenge
        const checkIfReviewedAlready = await drizzle_1.db.query.peerReviews.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.peerReviews.userProgressId, userProgressId), (0, drizzle_orm_1.eq)(schema_1.peerReviews.reviewerId, reviewerId))
        });
        if (checkIfReviewedAlready) {
            return res.json({ error: "You have already reviewed.can't review again", status: 500 });
        }
        const peerSubmission = await drizzle_1.db
            .insert(schema_1.peerReviews)
            .values({
            id: (0, uuid_1.v4)(),
            challengeId,
            reviewerId,
            userProgressId,
            comment,
            isApproved,
        })
            .returning();
        const countApprovals = await drizzle_1.db.query.peerReviews.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.peerReviews.isApproved, true), (0, drizzle_orm_1.eq)(schema_1.peerReviews.userProgressId, userProgressId))
        });
        if (countApprovals.length >= 3) {
            await drizzle_1.db.update(schema_1.userProgress).set({
                isCompleted: true,
                completedAt: new Date()
            }).where((0, drizzle_orm_1.eq)(schema_1.userProgress.id, userProgressId));
            // Get challenge score
            const challengeData = await drizzle_1.db.query.challenges.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.challenges.id, challengeId)
            });
            console.log("challenge data1:", challengeData);
            if (challengeData) {
                console.log("challengeData2:", challengeData);
                console.log(userProgressId, challengeData.score, challengeId);
                const userScore = await drizzle_1.db.insert(schema_1.userScores).values({
                    id: (0, uuid_1.v4)(),
                    userId: userProgressId,
                    score: challengeData.score,
                    challengeId: challengeId,
                }).returning();
                console.log("userScore:", userScore);
            }
            //calculate the user's total score from userScores table
            // const totalScore
        }
        if (peerSubmission) {
            return res
                .status(201)
                .json({
                message: "Peer review submitted successfully",
                peerSubmission,
                status: 201
            });
        }
        console.log(checkIfReviewedAlready);
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: "Failed to submit peer review", err: error });
    }
};
exports.submitPeerReview = submitPeerReview;
