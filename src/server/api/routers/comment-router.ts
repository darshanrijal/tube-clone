import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import { createCommentSchema } from "@/lib/validation";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
} from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const commentRouter = router({
  create: protectedProcedure
    .input(
      createCommentSchema.and(
        z.object({
          videoId: z.string().cuid2(),
          parentId: z.string().cuid2().nullish(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const { videoId, comment, parentId } = input;

      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComment] = await db
        .insert(comments)
        .values({
          comment,
          userId,
          videoId,
          parentId,
        })
        .returning({ id: comments.id });

      if (!createdComment?.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not post comment",
        });
      }
    }),
  get: publicProcedure
    .input(
      z.object({
        videoId: z.string().cuid2(),
        pagesize: z.number().default(DEFAULT_PAGINATION_LIMIT),
        cursor: z.number().int().nullish(),
        parentId: z.string().cuid2().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { pagesize, cursor, parentId } = input;
      const offset = cursor ?? 0;
      const { clerkId } = ctx;

      let userId: string | undefined;

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkId ? [clerkId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );

      const [allComments, totalCount] = await Promise.all([
        db
          .with(viewerReactions, replies)
          .select({
            ...getTableColumns(comments),
            user: {
              imageUrl: users.imageUrl,
              name: users.name,
              clerkId: users.clerkId,
            },
            viewerReaction: viewerReactions.type,
            likeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "like"),
                eq(commentReactions.commentId, comments.id)
              )
            ),
            dislikeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "dislike"),
                eq(commentReactions.commentId, comments.id)
              )
            ),
            replyCount: replies.count,
          })
          .from(comments)
          .limit(pagesize + 1)
          .offset(offset)
          .where(
            and(
              eq(comments.videoId, input.videoId),
              parentId
                ? eq(comments.parentId, parentId)
                : isNull(comments.parentId)
            )
          )
          .orderBy(desc(comments.createdAt))
          .innerJoin(users, eq(comments.userId, users.id))
          .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
          .leftJoin(replies, eq(replies.parentId, comments.id)),

        db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.videoId, input.videoId))
          .then((result) => result[0]?.count),
      ]);

      const nextCursor =
        allComments.length > pagesize ? pagesize + offset : null;
      const data = {
        comments: allComments.slice(0, pagesize),
        totalCount,
        nextCursor,
      };

      return data;
    }),
  remove: protectedProcedure
    .input(z.object({ commentId: z.string().cuid2() }))
    .mutation(async ({ input, ctx }) => {
      const [deltedComment] = await db
        .delete(comments)
        .where(
          and(
            eq(comments.userId, ctx.user.id),
            eq(comments.id, input.commentId)
          )
        )
        .returning({ id: comments.id });

      if (!deltedComment?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
    }),
});
