import {db} from '../db/drizzle';
import {challenges, userProgress,} from '../db/schema/schema';
import {v4 as uuidv4} from 'uuid';
import { Request,Response } from 'express';
import { and, asc, eq } from 'drizzle-orm';
import { error } from 'console';
import { comments, posts } from '../db/schema';
import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';

export const createComment=async(req:Request,res:Response)=>{
    try {
        const{content,userId,parentCommentId,postId}=req.body;
        console.log(req.body)
        const addComment=await db.insert(comments).values({id:uuidv4(),content,postId,userId,parentCommentId:parentCommentId || null}).returning();
        return res.json(addComment[0]);
    } catch (error) {
        return res.status(500).json({ error: "Failed to create post" });
        
    }
}

export const getAllComments = async (req: Request, res: Response) => {
    try {
      const commentsData = await db.query.comments.findMany({
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              imageUrl: true, // Include profile image
            },
          },
          replies: {
            with: {
              user: {
                columns: {
                  id: true,
                  username: true,
                  imageUrl: true,
                },
              },
              replies: {  // Fetch nested replies recursively
                with: {
                  user: {
                    columns: {
                      id: true,
                      username: true,
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
          post: {
            columns: {
              id: true,
              title: true,
              imageUrl: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        where: (comments, { isNull }) => isNull(comments.parentCommentId), // Fetch only top-level comments
        orderBy: [asc(comments.createdAt)],
      });
  
      return res.status(200).json(commentsData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
  };
  


  //get comments of a post up to nested level 2
  export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "postId is required" });
        }

        // Fetch top-level comments for the given postId
        const comment = await db.query.comments.findMany({
            where: (comments, { eq, and,isNull }) => 
                and(eq(comments.postId, id) , isNull(comments.parentCommentId)), // Only top-level comments

            with: {
                user: {
                    columns: {
                        id: true,
                        username: true,
                        imageUrl: true, // Include user profile image
                    },
                },
                replies: { 
                    with: {
                        user: {
                            columns: {
                                id: true,
                                username: true,
                                imageUrl: true,
                            },
                        },
                        replies: {  // Fetch nested replies (limited to 2 levels for performance)
                            with: {
                                user: {
                                    columns: {
                                        id: true,
                                        username: true,
                                        imageUrl: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: [asc(comments.createdAt)],
                },
            },

            orderBy: [asc(comments.createdAt)],
        });

        return res.status(200).json(comment);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ error: "Failed to fetch comments" });
    }
};


//get comments of all nested level of a post
export const getCommentsByPost1 = async (req: Request, res: Response) => {
  try {
      const {id} = req.params;
      if (!id) {
          return res.status(400).json({ error: "postId is required" });
      }

      // Fetch all comments for the post (flat structure)
      const comment = await db.query.comments.findMany({
          where: (comments, { eq }) => eq(comments.postId, id),

          with: {
              user: {
                  columns: {
                      id: true,
                      username: true,
                      imageUrl: true,
                  },
              },
          },

          orderBy: [asc(comments.createdAt)],  // Ensure chronological order
      });

      // Convert flat comments list into a nested tree
      const buildCommentTree:any = (parentCommentId: string | null) => {
          return comment
              .filter((comment: { parentCommentId: string | null; }) => comment.parentCommentId === parentCommentId)
              .map((comment: { id: string | null; }) => ({
                  ...comment,
                  replies: buildCommentTree(comment.id) // Recursively attach nested replies
              }));
      };

      const nestedComments = buildCommentTree(null); // Start from top-level comments

      return res.status(200).json(nestedComments);
  } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: "Failed to fetch comments" });
  }
};


