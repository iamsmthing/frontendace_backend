import {db} from '../db/drizzle';
import {challenges, userProgress,} from '../db/schema/schema';
import {v4 as uuidv4} from 'uuid';
import { Request,Response } from 'express';
import { and, eq } from 'drizzle-orm';
import { error } from 'console';


const difficultyScores: Record<string, number> = {
  "Easy": 10,
  "Medium": 20,
  "Hard": 30,
};

export const createChallenge=async(req:Request,res:Response)=>{
    try {
        const {title,difficulty,category,description,hints}=req.body;
        const score = difficultyScores[difficulty] || 0;
        const newChallenge = await db.insert(challenges).values({id:uuidv4(),title,difficulty,category,description,hints,score}).returning();
        return res.json(newChallenge);
      } catch (error) {
        return res.json({ error: error });
      }
    
}


// Bulk create challenges with dynamic category
export const bulkCreateChallenges = async (req: Request, res: Response) => {
    try {
        const challengeData = req.body; // Expect an array of challenges in request body

        // Validate input data
        if (!Array.isArray(challengeData) || challengeData.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty input data' });
        }

        // Map data and assign a unique ID for each challenge
        const data = challengeData.map((challenge: any) => ({
            id: uuidv4(),
            title: challenge.title,
            difficulty: challenge.difficulty,
            category: challenge.category, 
            description: challenge.description,
            hints: challenge.hints,
            score:difficultyScores[challenge.difficulty] || 0
        }));

        // Insert all challenges at once
        const newChallenges = await db.insert(challenges).values(data).returning();
        return res.json(newChallenges);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create challenges' });
    }
};
export const getChallenges=async(req:Request,res:Response)=>{
    try {
        const allChallenges = await db.select().from(challenges).orderBy(challenges.category);
        return res.json({problems:allChallenges});
      } catch (error) {
        return res.json({ error: 'Failed to get challenges' });
      }
    
}

export const getChallengeById = async (req: Request, res: Response) => {
    try {
        const  id  = req.query.id as string; // Get ID from route parameters
        const {userId}=req.body;
        // console.log(userId);
        // Validate userId
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        // Query the database to find the challenge by ID
        if (!id) {
            return res.status(400).json({ error: "ID is required as a query parameter." });
        }
        const challengeWithProgress = await db.query.challenges.findFirst({
            where:eq(challenges.id,id),
            with:{
                progress:{
                    where: eq(userProgress.userId,userId)
                }
            }
        })

        // Check if the challenge exists
        if (!challengeWithProgress) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

          // Determine if the challenge is completed based on progress data
          const progress = challengeWithProgress.progress?.[0];
          const isCompleted = progress?.isCompleted || false;
          

        // Return the challenge
        return res.json(challengeWithProgress);
    } catch (error) {
        console.error(error); // Log error for debugging
        return res.status(500).json({ error: 'Failed to get the challenge' });
    }
};


// Delete a challenge by ID
export const deleteChallenge = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Get ID from URL parameter

        // Check if ID is provided
        if (!id) {
            return res.status(400).json({ error: 'Challenge ID is required' });
        }

        // Delete the challenge
        const deletedChallenge = await db
            .delete(challenges)
            .where(eq(challenges.id, id))
            .returning(); // Return the deleted record (if needed)

        // Check if any record was deleted
        if (deletedChallenge.length === 0) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        return res.json({ message: 'Challenge deleted successfully', deletedChallenge });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to delete challenge' });
    }
};


export const markAsComplete=async (req:Request,res:Response)=>{
    try {
        const {isCompleted,userId,challengeId}=req.body;
        const existingProgress=await db.query.userProgress.findFirst({
            where:and(eq(userProgress.id,userId) ,eq(userProgress.challengeId,challengeId))
        })
        if(existingProgress){
            const result=await db.update(userProgress).set({
                isCompleted:!existingProgress.isCompleted,
                completedAt:!existingProgress.isCompleted?new Date():null,
                updatedAt:new Date()
            }).where(and(eq(userProgress.userId,userId) , eq(userProgress.challengeId,challengeId))).returning();
            return res.status(200).json({result,message:"Challenge updated successfully"});
        }
        else{
            // If no progress exists, create a new entry and mark it as complete
            const result=await db.insert(userProgress).values({
                id:uuidv4(),
                completedAt:new Date(),
                isCompleted,
                userId,
                challengeId,
                updatedAt:new Date()
            }).returning();
            console.log(result)
            return res.status(200).json({result,message:"Challenge updated successfully"});
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to delete challenge' });
    }


}