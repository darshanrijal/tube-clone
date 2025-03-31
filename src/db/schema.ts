import { createId } from "@paralleldrive/cuid2";
import {
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const id = text("id")
  .primaryKey()
  .notNull()
  .$defaultFn(() => createId());
const timestamps = {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable(
  "users",
  {
    id,
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex().on(t.clerkId)]
);

export const categories = pgTable(
  "categories",
  {
    id,
    name: text("name").notNull().unique(),
    description: text("description").notNull(),
  },
  (t) => [uniqueIndex().on(t.name)]
);

export const videoVisibility = pgEnum("video_visibility", [
  "PUBLIC",
  "PRIVATE",
]);
export const videoVisibilityEnum = videoVisibility.enumValues;

export const videos = pgTable("videos", {
  id,
  title: text("title").notNull(),
  description: text("description"),
  muxStatus: text("video_status").notNull(),
  muxAssetId: text("asset_id").unique(),
  muxUploadId: text("upload_id").notNull().unique(),
  muxPlaybackId: text("playback_id").unique(),
  muxTrackId: text("track_id").unique(),
  muxTrackStatus: text("track_status"),
  thumbnailUrl: text("thumbnail_url"),
  thumbnailKey: text("thumbnail_key").unique(),
  previewUrl: text("preview_url"),
  previewKey: text("preview_key").unique(),
  duration: integer("duration").notNull().default(0),
  visibility: videoVisibility("visibility").notNull().default("PRIVATE"),
  userId: text("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const videoViews = pgTable(
  "video_views",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.videoId] })]
);

export const reactionType = pgEnum("type", ["like", "dislike"]);
export type ReactionType = (typeof reactionType.enumValues)[number];
export const reactionEnum = reactionType.enumValues;

export const videoReactions = pgTable(
  "video_reactions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    type: reactionType("type").notNull(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.videoId] })]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    viewerId: text("viewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.viewerId, t.creatorId] })]
);

export const comments = pgTable(
  "comments",
  {
    id,
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    comment: varchar("comment", { length: 250 }).notNull(),
    ...timestamps,
  },
  (t) => [
    foreignKey({ columns: [t.parentId], foreignColumns: [t.id] }).onDelete(
      "cascade"
    ),
  ]
);

export const commentReactions = pgTable(
  "comment_reactions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commentId: text("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    type: reactionType("type").notNull(),
    ...timestamps,
  },
  (t) => [primaryKey({ columns: [t.userId, t.commentId] })]
);
