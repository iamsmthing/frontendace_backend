import {db} from '../db/drizzle';
import {v4 as uuidv4} from 'uuid';
import { Request,Response } from 'express';
import { and, eq } from 'drizzle-orm';
import {  upvotes } from '../db/schema';

export const toggleUpvote = async (req:Request, res:Response) => {
    try {
      const { userId, postId } = req.body;
  
      const existingUpvote = await db.query.upvotes.findFirst({
        where:and(eq(upvotes.userId,userId),eq(upvotes.postId,postId))
      })
  
      if (existingUpvote) {
        // Remove upvote
        await db.delete(upvotes).where(eq(upvotes.id,existingUpvote.id));
        return res.status(200).json({ message: "Upvote removed" });
      }
  
      // Add upvote
      const newUpvote = await db.insert(upvotes).values({id:uuidv4(), userId, postId }).returning();
     return  res.status(201).json(newUpvote);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to toggle upvote" });
    }
  };
  