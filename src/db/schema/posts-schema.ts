import { relations } from "drizzle-orm";
import {text,boolean,pgTable, serial,varchar, timestamp, uuid, AnyPgColumn, index} from'drizzle-orm/pg-core';
import { users } from "./schema";

export const posts = pgTable("posts", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id,{onDelete: 'cascade'}).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    imageUrl:text("image_url"),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("posts_user_id_idx").on(table.userId), // Index on userId
    createdAtIdx: index("posts_created_at_idx").on(table.createdAt), // Index on createdAt
  })
);
  
  export const comments = pgTable("comments", {
    id: text("id").primaryKey(), // Primary key for comments
    parentCommentId: text("parent_comment_id")
      .references((): AnyPgColumn => comments.id, { onDelete: "cascade" }), // Self-referencing parent comment ID
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(), // References the user who made the comment
    content: text("content").notNull(), // Content of the comment
    postId: text("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(), // References the associated post
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index("comments_post_id_idx").on(table.postId), // Index on postId
    userIdIdx: index("comments_user_id_idx").on(table.userId), // Index on userId
    parentCommentIdIdx: index("comments_parent_comment_id_idx").on(table.parentCommentId), // Index on parentCommentId
  })
);


  export const tags = pgTable("tags", {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(), // Tag name must be unique
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("tags_name_idx").on(table.name), // Index on name
  })
);


  // Junction table to associate posts and tags
export const postTags = pgTable("post_tags", {
  postId: text("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  tagId: text("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
},
(table) => ({
  postTagUniqueIdx: index("post_tags_unique_idx").on(table.postId, table.tagId), // Composite unique index
})
);

  export const upvotes = pgTable("upvotes", {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: text("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },

  (table) => ({
    postIdIdx: index("upvotes_post_id_idx").on(table.postId), // Index on postId
    userIdIdx: index("upvotes_user_id_idx").on(table.userId), // Index on userId
  })
);
  






  export const userPostCommentRelations = relations(users, ({ many }) => ({
    posts: many(posts), // A user can have many posts
    comments: many(comments), // A user can have many comments
    upvotes: many(upvotes),
  }));
  

  export const postRelations = relations(posts, ({ one, many }) => ({
    user: one(users, {
      fields: [posts.userId],
      references: [users.id],
    }), // A post belongs to a user
    comments: many(comments), // A post can have many comments
    tags: many(postTags), // Junction table to link tags
  upvotes: many(upvotes),
  }));
  

  export const tagRelations = relations(tags, ({ many }) => ({
    posts: many(postTags), // Junction table to link posts
  }));



  export const postTagRelations = relations(postTags, ({ one }) => ({
    post: one(posts,{
      fields: [postTags.postId],
      references: [posts.id],
    }),
    tag: one(tags,{
      fields: [postTags.tagId],
      references: [tags.id],
    }),
  }));


  export const upvoteRelations = relations(upvotes, ({ one }) => ({
    user: one(users,{
      fields: [upvotes.userId],
        references: [users.id],
    }),
    post: one(posts,{
      fields: [upvotes.postId],
    references: [posts.id],
    }),
  }));
  

  export const commentRelations = relations(comments, ({ one, many }) => ({
    user: one(users, {
      fields: [comments.userId],
      references: [users.id],
    }), // A comment belongs to a user
    post: one(posts, {
      fields: [comments.postId],
      references: [posts.id],
    }), // A comment belongs to a post
    parent: one(comments, {
      fields: [comments.parentCommentId],
      references: [comments.id],
      relationName: "parent_comment",  // ✅ Name the relation
    }), // A comment can have a parent comment
    replies: many(comments,{
      relationName: "parent_comment", // ✅ Use the same name for the inverse relation
    }), // A comment can have multiple replies
  }));