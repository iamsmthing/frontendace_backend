"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCloudinary = exports.extractUserId = exports.getAllPosts = exports.deletePost = exports.updatePost = exports.createPost = void 0;
const drizzle_1 = require("../db/drizzle");
const uuid_1 = require("uuid");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const cloudinary_1 = __importDefault(require("cloudinary"));
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const createPost = async (req, res) => {
    try {
        const { userId, title, description, imageUrl } = req.body;
        if (!userId || !title || !description) {
            return res.status(400).json({ error: "Required fields are missing" });
        }
        const newPost = await drizzle_1.db.insert(schema_1.posts).values({
            id: (0, uuid_1.v4)(),
            userId: userId,
            title: title,
            description: description,
            imageUrl,
        }).returning();
        return res.status(201).json(newPost);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to create post" });
    }
};
exports.createPost = createPost;
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, description, imageUrl } = req.body;
        const updatedPost = await drizzle_1.db.update(schema_1.posts)
            .set({ title, description, imageUrl })
            .where((0, drizzle_orm_1.eq)(schema_1.posts.id, postId)).returning();
        if (!updatedPost) {
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(200).json(updatedPost);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update post" });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const tokenUserId = (0, exports.extractUserId)(req, res);
        const deletedPost = await drizzle_1.db.delete(schema_1.posts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.posts.id, id), (0, drizzle_orm_1.eq)(schema_1.posts.userId, tokenUserId))).returning();
        const { imageUrl } = deletedPost[0];
        if (imageUrl)
            await (0, exports.removeFromCloudinary)(imageUrl);
        if (deletedPost.length == 0) {
            console.log(res.status);
            return res.status(404).json({ error: "Post not found" });
        }
        return res.status(200).json({ message: "Post deleted successfully", deletedPost });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to delete post" });
    }
};
exports.deletePost = deletePost;
const getAllPosts = async (req, res) => {
    try {
        const postsData = await drizzle_1.db.query.posts.findMany({
            with: {
                user: {
                    columns: {
                        password: false,
                    }
                },
                comments: true,
                tags: { with: { tag: true } },
                upvotes: true,
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.posts.createdAt)]
        });
        return res.status(200).json(postsData);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch posts" });
    }
};
exports.getAllPosts = getAllPosts;
const extractUserId = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1];
        // Verify the token and extract the payload
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    }
    catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.extractUserId = extractUserId;
const removeFromCloudinary = async (imageUrl) => {
    try {
        const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
        const result = await cloudinary_1.default.v2.api.resource(publicId);
        console.log(publicId, result);
        console.log(JSON.stringify(result));
        const res = await cloudinary_1.default.v2.uploader.destroy(publicId);
        console.log("Delete response:", res);
        return res;
    }
    catch (error) {
        console.error("Error:", error);
    }
};
exports.removeFromCloudinary = removeFromCloudinary;
