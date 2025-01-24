import { db } from "../db/drizzle";
import { challenges, peerReviews, userProgress } from "../db/schema/schema";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { and, asc, eq, not } from "drizzle-orm";
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
    const tokenUserId=extractUserId(req,res);
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
      where: and(eq(userProgress.isCompleted, false),not(eq(userProgress.userId,tokenUserId))),
    });
    if (challenges.length > 0) {
      return res.status(201).json(challenges);
    }
    return res.json(challenges)
  } catch (error) {
    return res.status(500).json({ error: "Failed to create post", err: error });
  }
};

export const getChallengeReviewsOfUser = async (req: Request, res: Response) => {
  try {
    const tokenUserId=extractUserId(req,res);
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
      where: eq(userProgress.userId,tokenUserId),
    });
    if (challenges.length > 0) {
      return res.status(201).json(challenges);
    }
    return res.json(challenges)
  } catch (error) {
    return res.status(500).json({ error: "Failed to fech reviews of challenges", err: error });
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
     

       // Fetch the user who submitted this challenge
       const challengeSubmission = await db.query.userProgress.findFirst({
        where: eq(userProgress.id ,userProgressId ),
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

    const checkIfReviewedAlready= await db.query.peerReviews.findFirst({
      where: and(eq(peerReviews.userProgressId, userProgressId),eq(peerReviews.reviewerId,reviewerId))
    })
    if(checkIfReviewedAlready){
      return res.json({error:"You have already reviewed.can't review again"})
    }

    const peerSubmission = await db
      .insert(peerReviews)
      .values({
        id: uuidv4(),
        challengeId,
        reviewerId,
        userProgressId,
        comment,
        isApproved,
      })
      .returning();
   


    const countApprovals=await db.query.peerReviews.findMany({
        where:and(eq(peerReviews.isApproved,true),eq(peerReviews.userProgressId,userProgressId))
    });
    if (countApprovals.length >= 3) {
          await db.update(userProgress).set({
            isCompleted: true,
            completedAt:new Date()
          }).where(eq(userProgress.id,userProgressId))
    }
    if (peerSubmission) {
        return res
          .status(201)
          .json({
            message: "Peer review submitted successfully",
            peerSubmission,
          });
      }
      console.log(checkIfReviewedAlready)
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to submit peer review", err: error });
  }
};
