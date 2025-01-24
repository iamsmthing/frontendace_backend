"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRelations = exports.upvoteRelations = exports.postTagRelations = exports.tagRelations = exports.postRelations = exports.userPostCommentRelations = exports.upvotes = exports.postTags = exports.tags = exports.comments = exports.posts = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const schema_1 = require("./schema");
exports.posts = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").references(() => schema_1.users.id, { onDelete: 'cascade' }).notNull(),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    imageUrl: (0, pg_core_1.text)("image_url"),
    description: (0, pg_core_1.text)("description").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)("posts_user_id_idx").on(table.userId), // Index on userId
    createdAtIdx: (0, pg_core_1.index)("posts_created_at_idx").on(table.createdAt), // Index on createdAt
}));
exports.comments = (0, pg_core_1.pgTable)("comments", {
    id: (0, pg_core_1.text)("id").primaryKey(), // Primary key for comments
    parentCommentId: (0, pg_core_1.text)("parent_comment_id")
        .references(() => exports.comments.id, { onDelete: "cascade" }), // Self-referencing parent comment ID
    userId: (0, pg_core_1.text)("user_id")
        .references(() => schema_1.users.id, { onDelete: "cascade" })
        .notNull(), // References the user who made the comment
    content: (0, pg_core_1.text)("content").notNull(), // Content of the comment
    postId: (0, pg_core_1.text)("post_id")
        .references(() => exports.posts.id, { onDelete: "cascade" })
        .notNull(), // References the associated post
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    postIdIdx: (0, pg_core_1.index)("comments_post_id_idx").on(table.postId), // Index on postId
    userIdIdx: (0, pg_core_1.index)("comments_user_id_idx").on(table.userId), // Index on userId
    parentCommentIdIdx: (0, pg_core_1.index)("comments_parent_comment_id_idx").on(table.parentCommentId), // Index on parentCommentId
}));
exports.tags = (0, pg_core_1.pgTable)("tags", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull().unique(), // Tag name must be unique
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)("tags_name_idx").on(table.name), // Index on name
}));
// Junction table to associate posts and tags
exports.postTags = (0, pg_core_1.pgTable)("post_tags", {
    postId: (0, pg_core_1.text)("post_id")
        .references(() => exports.posts.id, { onDelete: "cascade" })
        .notNull(),
    tagId: (0, pg_core_1.text)("tag_id")
        .references(() => exports.tags.id, { onDelete: "cascade" })
        .notNull(),
}, (table) => ({
    postTagUniqueIdx: (0, pg_core_1.index)("post_tags_unique_idx").on(table.postId, table.tagId), // Composite unique index
}));
exports.upvotes = (0, pg_core_1.pgTable)("upvotes", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id")
        .references(() => schema_1.users.id, { onDelete: "cascade" })
        .notNull(),
    postId: (0, pg_core_1.text)("post_id")
        .references(() => exports.posts.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => ({
    postIdIdx: (0, pg_core_1.index)("upvotes_post_id_idx").on(table.postId), // Index on postId
    userIdIdx: (0, pg_core_1.index)("upvotes_user_id_idx").on(table.userId), // Index on userId
}));
exports.userPostCommentRelations = (0, drizzle_orm_1.relations)(schema_1.users, ({ many }) => ({
    posts: many(exports.posts), // A user can have many posts
    comments: many(exports.comments), // A user can have many comments
    upvotes: many(exports.upvotes),
}));
exports.postRelations = (0, drizzle_orm_1.relations)(exports.posts, ({ one, many }) => ({
    user: one(schema_1.users, {
        fields: [exports.posts.userId],
        references: [schema_1.users.id],
    }), // A post belongs to a user
    comments: many(exports.comments), // A post can have many comments
    tags: many(exports.postTags), // Junction table to link tags
    upvotes: many(exports.upvotes),
}));
exports.tagRelations = (0, drizzle_orm_1.relations)(exports.tags, ({ many }) => ({
    posts: many(exports.postTags), // Junction table to link posts
}));
exports.postTagRelations = (0, drizzle_orm_1.relations)(exports.postTags, ({ one }) => ({
    post: one(exports.posts, {
        fields: [exports.postTags.postId],
        references: [exports.posts.id],
    }),
    tag: one(exports.tags, {
        fields: [exports.postTags.tagId],
        references: [exports.tags.id],
    }),
}));
exports.upvoteRelations = (0, drizzle_orm_1.relations)(exports.upvotes, ({ one }) => ({
    user: one(schema_1.users, {
        fields: [exports.upvotes.userId],
        references: [schema_1.users.id],
    }),
    post: one(exports.posts, {
        fields: [exports.upvotes.postId],
        references: [exports.posts.id],
    }),
}));
exports.commentRelations = (0, drizzle_orm_1.relations)(exports.comments, ({ one, many }) => ({
    user: one(schema_1.users, {
        fields: [exports.comments.userId],
        references: [schema_1.users.id],
    }), // A comment belongs to a user
    post: one(exports.posts, {
        fields: [exports.comments.postId],
        references: [exports.posts.id],
    }), // A comment belongs to a post
    parent: one(exports.comments, {
        fields: [exports.comments.parentCommentId],
        references: [exports.comments.id],
        relationName: "parent_comment", // ✅ Name the relation
    }), // A comment can have a parent comment
    replies: many(exports.comments, {
        relationName: "parent_comment", // ✅ Use the same name for the inverse relation
    }), // A comment can have multiple replies
}));
