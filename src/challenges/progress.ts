import { db } from "../db/drizzle";
import { challenges, userProgress } from "../db/schema/schema";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { error } from "console";

export const markAsComplete = async (req: Request, res: Response) => {
  try {
    const { userId, challengeId, isCompleted, } = req.body;

    // Validate the inputs
    if (!userId || !challengeId || typeof isCompleted !== "boolean") {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // check if progress already exists
    const existingProgress=await db.select().from(userProgress).where(eq(userProgress.id,userId) && eq(userProgress.challengeId,challengeId));

    // if progress already exists, then update it
    if(existingProgress.length>0){
       await db.update(userProgress).set({isCompleted,completedAt:isCompleted?new Date():null,updatedAt:new Date()})
        .where(eq(userProgress.userId,userId) && eq(userProgress.challengeId,challengeId));
        return res.status(200).json({message:'Challenge updated successfully'});
    }

    // if progress does not exist
    await db.insert(userProgress).values({id:uuidv4(),userId,challengeId,isCompleted,completedAt:isCompleted?new Date():null,updatedAt:new Date()})
    
    return res.status(200).json({message:"challenge marked as complete"});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllProblemsWithCompletionStatus =async(req:Request,res:Response)=>{

    try {
        const {userID}=req.body;
        if(!userID){
            return res.status(400).json({message:"Invalid user ID"});

        }
        // Fetch all problems with user's progress using relation mapping

        const problems=await db.query.challenges.findMany({
            with:{
                progress:{
                    where: eq(userProgress.userId,userID)
                }
            }
        })

        return res.status(200).json({problems});
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}