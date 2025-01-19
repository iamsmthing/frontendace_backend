import { relations } from "drizzle-orm";
import {text,boolean,pgTable, serial,varchar, timestamp, uuid, integer, index} from'drizzle-orm/pg-core';


export const users=pgTable("users",{
    id:text('id').primaryKey(),
    username:varchar('username',{length:50}).notNull(),
    email:varchar('email',{length:100}).notNull(),
    password:varchar('password',{length:255}).notNull(),
    imageUrl:text('image_url'),
    score: integer("score").default(0).notNull(), // New column for storing the user's total score
    weeklyScore: integer("weekly_score").default(0).notNull(), // Weekly score
    monthlyScore: integer("monthly_score").default(0).notNull(), // Monthly score
    createdAt:timestamp('created_at').defaultNow().notNull()
},
(table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  scoreIdx: index("users_score_idx").on(table.score), // Index for leaderboard queries
  weeklyScoreIdx: index("users_weekly_score_idx").on(table.weeklyScore), // Index for leaderboard queries
  monthlyScoreIdx: index("users_monthly_score_idx").on(table.monthlyScore), // Index for leaderboard queries
})
);

export const userScores=pgTable("user_scores",{
  id:text("id").primaryKey(),
  userId:text("user_id").references(()=>users.id,{onDelete:'cascade'}).notNull(),
  challengeId:text("challenge_id"),
  score:integer("score").notNull(),
  createdAt:timestamp("created_at").defaultNow().notNull()
},
(table) => ({
  userIdIdx:index("user_scores_user_id_idx").on(table.userId),
  createdAt:index("user_scores_created_at_idx").on(table.createdAt)
}));


export const badges=pgTable("badges",{
  id:text("id").primaryKey(),
  name:text("name").notNull(),
  description:text("description"),
  scoreThreshold:integer("score_threshold").notNull(),
})


export const userBadges=pgTable("user_badges",{
  userId:text("user_id").references(()=>users.id,{onDelete:'cascade'}).notNull(),
  badgeId:text("badge_id").references(()=>badges.id,{onDelete:'cascade'}).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
})



export const leaderBoardSnapshots=pgTable("leaderboard_snapshots",{
  id:text("id").primaryKey(),
  userId:text("user_id").references(()=>users.id,{onDelete:'cascade'}).notNull(),
  snapshotType:varchar("snapshot_type",{length:20}).notNull(),
  score:integer("score").notNull(), //snapshot score
  rank:integer("rank").notNull(), // Rank during the snapshot
  createdAt:timestamp("created_at").defaultNow().notNull()
})

export const challenges = pgTable('challenges', {
    id: varchar('id', { length: 255 }).primaryKey(),
    title: text('title').notNull(),
    difficulty: varchar('difficulty', { length: 50 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    description: text('description').notNull(),
    hints: text('hints').array(),
    score: integer('score'), // Predefined score based on difficulty
  });
  

  // ---------------- USER PROGRESS TABLE ----------------
export const userProgress = pgTable("user_progress", {
    id:text('id').primaryKey(),
    userId: text("user_id").references(() => users.id,{onDelete: 'cascade'}).notNull(),
    challengeId: text("challenge_id").references(() => challenges.id,{onDelete: 'cascade'}).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    completedAt: timestamp("completed_at"), // nullable, only filled when completed
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  });




  // ---------------- USERS RELATIONS ----------------

  export const userRelations=relations(users,({many})=>({
    progress:many(userProgress),   // A user can have multiple progress entries
    scores:many(userScores), // Relation to the user's scores
    badges:many(userBadges), // Relation to the user's badges
    leaderboardSnapshots:many(leaderBoardSnapshots), // Relation to the user's leaderboard snapshots
  }))
//   Explanation:

//   usersRelations establishes that:
//       One user can have many progress entries in the userProgress table.
//       This relationship is one-to-many (1 user → many progress records).
//   This is mapped using the many keyword because one user can attempt many challenges.



export const badgeRelations=relations(badges,({many})=>({
  users:many(userBadges),
}))



export const userBadgeRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));


export const leaderboardSnapshotRelations = relations(leaderBoardSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [leaderBoardSnapshots.userId],
    references: [users.id],
  }),
}));


export const userScoreRelations=relations(userScores,({one})=>({
  user:one(users,{
    fields:[userScores.userId],
    references:[users.id]
  }), // One user can have one score entry
}))



  // ---------------- CHALLENGES RELATIONS ----------------

  export const challengeRelations=relations(challenges,({many})=>({
    progress:many(userProgress) // A challenge can have multiple progress entries
  }))

//   Explanation:

//     challengesRelations establishes that:
//         One challenge can have many progress entries in the userProgress table.
//         This is also a one-to-many relationship (1 challenge → many progress records).
//     This is mapped using the many keyword because one challenge can be attempted by many users.



  // ---------------- USER PROGRESS RELATIONS ----------------
  export const userProgressRelations = relations(userProgress, ({ one }) => ({
    user: one(users, {
      fields: [userProgress.userId], // Maps userId in userProgress
      references: [users.id],  // References id in users table
    }),
    challenge: one(challenges, {
      fields: [userProgress.challengeId], // Maps challengeId in userProgress
      references: [challenges.id], // References id in challenges table
    }),
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



// Summary of Relationships

//     Users → Progress:
//         One-to-Many: A user can have multiple progress records.
//     Challenges → Progress:
//         One-to-Many: A challenge can be attempted by multiple users.
//     Progress → Users:
//         Many-to-One: Each progress entry belongs to one user.
//     Progress → Challenges:
//         Many-to-One: Each progress entry is for one challenge.