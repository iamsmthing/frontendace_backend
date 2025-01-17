import {db} from '../db/drizzle';
import {challenges, userProgress,} from '../db/schema/schema';
import {v4 as uuidv4} from 'uuid';
import { Request,Response } from 'express';
import { and, asc, eq } from 'drizzle-orm';
import { error } from 'console';
import { posts } from '../db/schema';
import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';
import { decode } from 'punycode';

export const createPost = async (req:Request, res:Response) => {
  try {
    const { userId, title, description, imageUrl } = req.body;
    if (!userId || !title || !description) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const newPost = await db.insert(posts).values({
        id:uuidv4(),
        userId:userId,
        title:title,
        description:description,
        imageUrl,
        
    }).returning();

   return  res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create post" });
  }
};


export const updatePost = async (req:Request, res:Response) => {
    try {
      const { postId } = req.params;
      const { title, description, imageUrl } = req.body;
  
      const updatedPost = await db.update(posts)
        .set({ title, description, imageUrl })
        .where(eq(posts.id,postId)).returning();
  
      if (!updatedPost) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      return res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update post" });
    }
  };
  
  export const deletePost = async (req:Request, res:Response) => {
    try {
      const { id } = req.params;
      const tokenUserId=extractUserId(req,res);
  
      const deletedPost = await db.delete(posts).where(and(eq(posts.id,id) , eq(posts.userId,tokenUserId))).returning();
      console.log(deletedPost)
  
      if (deletedPost.length==0) {
        console.log(res.status)
        return res.status(404).json({ error: "Post not found" });
      }
      return res.status(200).json({ message: "Post deleted successfully", deletedPost });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete post" });
    }
  };
  

  export const getAllPosts = async (req:Request, res:Response) => {
    try {
      const postsData = await db.query.posts.findMany({
        with: {
          user: {
            columns:{
                password:false
            }
          },
          comments: true,
          tags: { with: { tag: true } },
          upvotes: true,
        },
        orderBy:[asc(posts.createdAt)]
      });
  
      return res.status(200).json(postsData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  };
  

export const extractUserId=(req:Request,res:Response)=>{
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
      
    }
    const token = authHeader.split(' ')[1];
     // Verify the token and extract the payload
     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
     console.log(decoded);
     return decoded.id;
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
}