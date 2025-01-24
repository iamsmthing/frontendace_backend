"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentsByPost1 = exports.getCommentsByPost = exports.getAllComments = exports.createComment = void 0;
const drizzle_1 = require("../db/drizzle");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
require("dotenv/config");
const createComment = async (req, res) => {
    try {
        const { content, userId, parentCommentId, postId } = req.body;
        console.log(req.body);
        const addComment = await drizzle_1.db.insert(schema_1.comments).values({ id: (0, uuid_1.v4)(), content, postId, userId, parentCommentId: parentCommentId || null }).returning();
        return res.json(addComment[0]);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to create post" });
    }
};
exports.createComment = createComment;
const getAllComments = async (req, res) => {
    try {
        const commentsData = await drizzle_1.db.query.comments.findMany({
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
                        replies: {
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
            orderBy: [(0, drizzle_orm_1.asc)(schema_1.comments.createdAt)],
        });
        return res.status(200).json(commentsData);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch comments" });
    }
};
exports.getAllComments = getAllComments;
//get comments of a post up to nested level 2
const getCommentsByPost = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "postId is required" });
        }
        // Fetch top-level comments for the given postId
        const comment = await drizzle_1.db.query.comments.findMany({
            where: (comments, { eq, and, isNull }) => and(eq(comments.postId, id), isNull(comments.parentCommentId)), // Only top-level comments
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
                        replies: {
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
                    orderBy: [(0, drizzle_orm_1.asc)(schema_1.comments.createdAt)],
                },
            },
            orderBy: [(0, drizzle_orm_1.asc)(schema_1.comments.createdAt)],
        });
        return res.status(200).json(comment);
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ error: "Failed to fetch comments" });
    }
};
exports.getCommentsByPost = getCommentsByPost;
//get comments of all nested level of a post
const getCommentsByPost1 = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "postId is required" });
        }
        // Fetch all comments for the post (flat structure)
        const comment = await drizzle_1.db.query.comments.findMany({
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
            orderBy: [(0, drizzle_orm_1.asc)(schema_1.comments.createdAt)], // Ensure chronological order
        });
        // Convert flat comments list into a nested tree
        const buildCommentTree = (parentCommentId) => {
            return comment
                .filter((comment) => comment.parentCommentId === parentCommentId)
                .map((comment) => (Object.assign(Object.assign({}, comment), { replies: buildCommentTree(comment.id) // Recursively attach nested replies
             })));
        };
        const nestedComments = buildCommentTree(null); // Start from top-level comments
        return res.status(200).json(nestedComments);
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ error: "Failed to fetch comments" });
    }
};
exports.getCommentsByPost1 = getCommentsByPost1;
