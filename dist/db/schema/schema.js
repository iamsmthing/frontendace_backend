"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peerReviewRelations = exports.userProgressRelations = exports.challengeRelations = exports.userScoreRelations = exports.leaderboardSnapshotRelations = exports.userBadgeRelations = exports.badgeRelations = exports.userRelations = exports.peerReviews = exports.userProgress = exports.challenges = exports.leaderBoardSnapshots = exports.userBadges = exports.badges = exports.userScores = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)('id').primaryKey(),
    username: (0, pg_core_1.varchar)('username', { length: 50 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 100 }).notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 255 }).notNull(),
    imageUrl: (0, pg_core_1.text)('image_url'),
    score: (0, pg_core_1.integer)("score").default(0).notNull(), // New column for storing the user's total score
    weeklyScore: (0, pg_core_1.integer)("weekly_score").default(0).notNull(), // Weekly score
    monthlyScore: (0, pg_core_1.integer)("monthly_score").default(0).notNull(), // Monthly score
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull()
}, (table) => ({
    emailIdx: (0, pg_core_1.index)("users_email_idx").on(table.email),
    scoreIdx: (0, pg_core_1.index)("users_score_idx").on(table.score), // Index for leaderboard queries
    weeklyScoreIdx: (0, pg_core_1.index)("users_weekly_score_idx").on(table.weeklyScore), // Index for leaderboard queries
    monthlyScoreIdx: (0, pg_core_1.index)("users_monthly_score_idx").on(table.monthlyScore), // Index for leaderboard queries
}));
exports.userScores = (0, pg_core_1.pgTable)("user_scores", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    challengeId: (0, pg_core_1.text)("challenge_id"),
    score: (0, pg_core_1.integer)("score").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
}, (table) => ({
    userIdIdx: (0, pg_core_1.index)("user_scores_user_id_idx").on(table.userId),
    createdAt: (0, pg_core_1.index)("user_scores_created_at_idx").on(table.createdAt)
}));
exports.badges = (0, pg_core_1.pgTable)("badges", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    scoreThreshold: (0, pg_core_1.integer)("score_threshold").notNull(),
});
exports.userBadges = (0, pg_core_1.pgTable)("user_badges", {
    userId: (0, pg_core_1.text)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    badgeId: (0, pg_core_1.text)("badge_id").references(() => exports.badges.id, { onDelete: 'cascade' }).notNull(),
    earnedAt: (0, pg_core_1.timestamp)("earned_at").defaultNow().notNull(),
});
exports.leaderBoardSnapshots = (0, pg_core_1.pgTable)("leaderboard_snapshots", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    snapshotType: (0, pg_core_1.varchar)("snapshot_type", { length: 20 }).notNull(),
    score: (0, pg_core_1.integer)("score").notNull(), //snapshot score
    rank: (0, pg_core_1.integer)("rank").notNull(), // Rank during the snapshot
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull()
});
exports.challenges = (0, pg_core_1.pgTable)('challenges', {
    id: (0, pg_core_1.varchar)('id', { length: 255 }).primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    difficulty: (0, pg_core_1.varchar)('difficulty', { length: 50 }).notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    hints: (0, pg_core_1.text)('hints').array(),
    score: (0, pg_core_1.integer)('score'), // Predefined score based on difficulty
});
// ---------------- USER PROGRESS TABLE ----------------
exports.userProgress = (0, pg_core_1.pgTable)("user_progress", {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)("user_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    challengeId: (0, pg_core_1.text)("challenge_id").references(() => exports.challenges.id, { onDelete: 'cascade' }).notNull(),
    isCompleted: (0, pg_core_1.boolean)("is_completed").default(false).notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"), // nullable, only filled when completed
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    code: (0, pg_core_1.text)("code"), // Stores the submitted code
    imageUrl: (0, pg_core_1.text)("image_url"), // Screenshot of completed challenge
});
exports.peerReviews = (0, pg_core_1.pgTable)("peer_reviews", {
    id: (0, pg_core_1.text)("id").primaryKey(),
    challengeId: (0, pg_core_1.text)("challenge_id").references(() => exports.challenges.id, { onDelete: 'cascade' }).notNull(),
    reviewerId: (0, pg_core_1.text)("reviewer_id").references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    userProgressId: (0, pg_core_1.text)("user_progress_id").references(() => exports.userProgress.id, { onDelete: 'cascade' }).notNull(),
    comment: (0, pg_core_1.text)("comment"),
    isApproved: (0, pg_core_1.boolean)("is_approved").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// ---------------- USERS RELATIONS ----------------
exports.userRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    progress: many(exports.userProgress), // A user can have multiple progress entries
    scores: many(exports.userScores), // Relation to the user's scores
    badges: many(exports.userBadges), // Relation to the user's badges
    leaderboardSnapshots: many(exports.leaderBoardSnapshots), // Relation to the user's leaderboard snapshots
    peerReviews: many(exports.peerReviews), // Relation to the user's peer reviews
}));
//   Explanation:
//   usersRelations establishes that:
//       One user can have many progress entries in the userProgress table.
//       This relationship is one-to-many (1 user → many progress records).
//   This is mapped using the many keyword because one user can attempt many challenges.
exports.badgeRelations = (0, drizzle_orm_1.relations)(exports.badges, ({ many }) => ({
    users: many(exports.userBadges),
}));
exports.userBadgeRelations = (0, drizzle_orm_1.relations)(exports.userBadges, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userBadges.userId],
        references: [exports.users.id],
    }),
    badge: one(exports.badges, {
        fields: [exports.userBadges.badgeId],
        references: [exports.badges.id],
    }),
}));
exports.leaderboardSnapshotRelations = (0, drizzle_orm_1.relations)(exports.leaderBoardSnapshots, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.leaderBoardSnapshots.userId],
        references: [exports.users.id],
    }),
}));
exports.userScoreRelations = (0, drizzle_orm_1.relations)(exports.userScores, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.userScores.userId],
        references: [exports.users.id]
    }), // One user can have one score entry
}));
// ---------------- CHALLENGES RELATIONS ----------------
exports.challengeRelations = (0, drizzle_orm_1.relations)(exports.challenges, ({ many }) => ({
    progress: many(exports.userProgress), // A challenge can have multiple progress entries
    peerReviews: many(exports.peerReviews)
}));
//   Explanation:
//     challengesRelations establishes that:
//         One challenge can have many progress entries in the userProgress table.
//         This is also a one-to-many relationship (1 challenge → many progress records).
//     This is mapped using the many keyword because one challenge can be attempted by many users.
// ---------------- USER PROGRESS RELATIONS ----------------
exports.userProgressRelations = (0, drizzle_orm_1.relations)(exports.userProgress, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.userProgress.userId], // Maps userId in userProgress
        references: [exports.users.id], // References id in users table
    }),
    challenge: one(exports.challenges, {
        fields: [exports.userProgress.challengeId], // Maps challengeId in userProgress
        references: [exports.challenges.id], // References id in challenges table
    }),
    peerReviews: many(exports.peerReviews)
}));
//   Explanation:
//   userProgressRelations establishes that:
//       Each progress entry belongs to one user and one challenge.
//       This relationship is many-to-one (many progress records → one user, one challenge).
//   user Relation:
//       Maps the userId in the userProgress table to the id in the users table.
//       Uses the one keyword because each progress record belongs to exactly one user.
//   challenge Relation:
//       Maps the challengeId in the userProgress table to the id in the challenges table.
//       Uses the one keyword because each progress record belongs to exactly one challenge.
// Peer Review relations
exports.peerReviewRelations = (0, drizzle_orm_1.relations)(exports.peerReviews, ({ one }) => ({
    challenge: one(exports.challenges, {
        fields: [exports.peerReviews.challengeId],
        references: [exports.challenges.id],
    }),
    reviewer: one(exports.users, {
        fields: [exports.peerReviews.reviewerId],
        references: [exports.users.id],
    }),
    userProgress: one(exports.userProgress, {
        fields: [exports.peerReviews.userProgressId],
        references: [exports.userProgress.id],
    }),
}));
// Summary of Relationships
//     Users → Progress:
//         One-to-Many: A user can have multiple progress records.
//     Challenges → Progress:
//         One-to-Many: A challenge can be attempted by multiple users.
//     Progress → Users:
//         Many-to-One: Each progress entry belongs to one user.
//     Progress → Challenges:
//         Many-to-One: Each progress entry is for one challenge.
