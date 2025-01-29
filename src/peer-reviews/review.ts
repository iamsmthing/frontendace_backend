import { db } from "../db/drizzle";
import {
  challenges,
  peerReviews,
  userProgress,
  users,
  userScores,
} from "../db/schema/schema";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { and, asc, eq, not, sql } from "drizzle-orm";
import { error } from "console";
import { comments, posts } from "../db/schema";
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { uuid } from "drizzle-orm/pg-core";
import { extractUserId } from "../user_post/post";
import { notEqual } from "assert";

export const submitChallengeForReview = async (req: Request, res: Response) => {
  try {
    const { userId, challengeId, code, imageUrl } = req.body;
    const submitChallenge = await db
      .insert(userProgress)
      .values({
        id: uuidv4(),
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
  } catch (error) {
    return res.status(500).json({ error: "Failed to create post", err: error });
  }
};

export const getPendingPeerReviews = async (req: Request, res: Response) => {
  try {
    const tokenUserId = extractUserId(req, res);
    const challenges = await db.query.userProgress.findMany({
      with: {
        challenge: true,
        user: { columns: { username: true, imageUrl: true } },
        peerReviews: {
          with: {
            reviewer: { columns: { username: true, imageUrl: true } },
          },
        },
      },
      where: and(
        eq(userProgress.isCompleted, false),
        not(eq(userProgress.userId, tokenUserId))
      ),
    });
    if (challenges.length > 0) {
      return res.status(201).json(challenges);
    }
    return res.json(challenges);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create post", err: error });
  }
};

export const getChallengeReviewsOfUser = async (
  req: Request,
  res: Response
) => {
  try {
    const tokenUserId = extractUserId(req, res);
    const challenges = await db.query.userProgress.findMany({
      with: {
        challenge: true,
        user: { columns: { username: true, imageUrl: true } },
        peerReviews: {
          with: {
            reviewer: { columns: { username: true, imageUrl: true } },
          },
        },
      },
      where: eq(userProgress.userId, tokenUserId),
    });
    if (challenges.length > 0) {
      return res.status(201).json(challenges);
    }
    return res.json(challenges);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fech reviews of challenges", err: error });
  }
};

export const getPendingPeerReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = await db.query.userProgress.findFirst({
      with: {
        challenge: true,
        user: { columns: { username: true, imageUrl: true } },
        peerReviews: {
          with: {
            reviewer: { columns: { username: true, imageUrl: true } },
          },
        },
      },
      where: and(eq(userProgress.isCompleted, false), eq(userProgress.id, id)),
    });
    if (challenge) {
      return res.status(201).json(challenge);
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch pending review", err: error });
  }
};

export const submitPeerReview = async (req: Request, res: Response) => {
  try {
    const { reviewerId, userProgressId, challengeId, comment, isApproved } =
      req.body;
      const tokenUserId = extractUserId(req, res);
      let verifiedReviewerId='';
      if(reviewerId===tokenUserId){
        verifiedReviewerId=tokenUserId;
      }

    // Fetch the user who submitted this challenge
    const challengeSubmission = await db.query.userProgress.findFirst({
      where: eq(userProgress.id, userProgressId),
      columns: { userId: true }, // Fetch only the userId
    });
    if (!challengeSubmission) {
      return res.status(404).json({ error: "Challenge submission not found." });
    }

    // Prevent users from approving their own challenge
    if (challengeSubmission.userId === verifiedReviewerId) {
      return res
        .status(403)
        .json({ error: "You cannot approve your own challenge." });
    }

    //check if the reviewer has already reviewed the challenge

    const checkIfReviewedAlready = await db.query.peerReviews.findFirst({
      where: and(
        eq(peerReviews.userProgressId, userProgressId),
        eq(peerReviews.reviewerId, verifiedReviewerId)
      ),
    });
    if (checkIfReviewedAlready) {
      return res.json({
        error: "You have already reviewed.can't review again",
        status: 500,
      });
    }
    

    const peerSubmission = await db
      .insert(peerReviews)
      .values({
        id: uuidv4(),
        challengeId,
        reviewerId:verifiedReviewerId,
        userProgressId,
        comment,
        isApproved,
      })
      .returning();

      //reward user 2 points when reviewing a challenge
      const reviewerScore = await db.query.users.findFirst({
        columns: {
          score: true
        },
        where: eq(users.id, verifiedReviewerId)
      });
      
      if (reviewerScore) {
        await db.update(users).set({ score: reviewerScore.score + 2 }).where(eq(users.id, verifiedReviewerId));
      } else {
        console.error(`Reviewer score not found for user ID ${verifiedReviewerId}`);
      }

    const countApprovals = await db.query.peerReviews.findMany({
      where: and(
        eq(peerReviews.isApproved, true),
        eq(peerReviews.userProgressId, userProgressId)
      ),
    });
    if (countApprovals.length >= 3) {
      await db
        .update(userProgress)
        .set({
          isCompleted: true,
          completedAt: new Date(),
        })
        .where(eq(userProgress.id, userProgressId));

      // Get challenge score
      

      const challengeData = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId),
      });
      try {
        if (!challengeData) {
          console.error("Error: challengeData is undefined!");
          return res.status(400).json({ error: "Challenge data not found" });
        }

        if (!challengeData.score) {
          console.error("Error: challengeData.score is undefined!");
          return res.status(400).json({ error: "Challenge score is missing" });
        }

        console.log("challengeData:", challengeData);
        console.log("challengeSubmitterId:", challengeSubmission.userId);
        console.log("challengeId:", challengeId);

        const userScore = await db
          .insert(userScores)
          .values({
            id: uuidv4(),
            userId: challengeSubmission.userId, // Ensure this is the correct user ID
            score: challengeData.score!,
            challengeId: challengeId,
          })
          .returning();
        console.log("Inserted userScore:", userScore);
        //calculate the user's total score from userScores table
        const totalChallenges = await db.query.userScores.findMany({
          where: eq(userScores.userId, challengeSubmission.userId),
        });

        const totalScore = totalChallenges.reduce(
          (total, current) => total + current.score,
          0
        );
        //update the user's  score in the users table
        const user_score = await db
          .update(users)
          .set({
            score: totalScore,
          })
          .where(eq(users.id, challengeSubmission.userId))
          .returning();

        console.log("user score :", user_score);
      } catch (error) {
        console.error("Error inserting user score:", error);
      }
    }

    if (peerSubmission) {
      return res.status(201).json({
        message: "Peer review submitted successfully",
        peerSubmission,
        status: 201,
      });
    }
    console.log(checkIfReviewedAlready);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to submit peer review", err: error });
  }
};
