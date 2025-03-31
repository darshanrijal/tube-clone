import { DEFAULT_PAGINATION_LIMIT } from "@/constants";
import { db } from "@/db";
import { commentReactionTable, commentTable, userTable } from "@/db/schema";
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
        .from(commentTable)
        .where(inArray(commentTable.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [createdComment] = await db
        .insert(commentTable)
        .values({
          comment,
          userId,
          videoId,
          parentId,
        })
        .returning({ id: commentTable.id });

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
        .from(userTable)
        .where(inArray(userTable.clerkId, clerkId ? [clerkId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactionTable.commentId,
            type: commentReactionTable.type,
          })
          .from(commentReactionTable)
          .where(inArray(commentReactionTable.userId, userId ? [userId] : []))
      );

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: commentTable.parentId,
            count: count(commentTable.id).as("count"),
          })
          .from(commentTable)
          .where(isNotNull(commentTable.parentId))
          .groupBy(commentTable.parentId)
      );

      const [allComments, totalCount] = await Promise.all([
        db
          .with(viewerReactions, replies)
          .select({
            ...getTableColumns(commentTable),
            user: {
              imageUrl: userTable.imageUrl,
              name: userTable.name,
              clerkId: userTable.clerkId,
            },
            viewerReaction: viewerReactions.type,
            likeCount: db.$count(
              commentReactionTable,
              and(
                eq(commentReactionTable.type, "like"),
                eq(commentReactionTable.commentId, commentTable.id)
              )
            ),
            dislikeCount: db.$count(
              commentReactionTable,
              and(
                eq(commentReactionTable.type, "dislike"),
                eq(commentReactionTable.commentId, commentTable.id)
              )
            ),
            replyCount: replies.count,
          })
          .from(commentTable)
          .limit(pagesize + 1)
          .offset(offset)
          .where(
            and(
              eq(commentTable.videoId, input.videoId),
              parentId
                ? eq(commentTable.parentId, parentId)
                : isNull(commentTable.parentId)
            )
          )
          .orderBy(desc(commentTable.createdAt))
          .innerJoin(userTable, eq(commentTable.userId, userTable.id))
          .leftJoin(
            viewerReactions,
            eq(viewerReactions.commentId, commentTable.id)
          )
          .leftJoin(replies, eq(replies.parentId, commentTable.id)),

        db
          .select({ count: count() })
          .from(commentTable)
          .where(eq(commentTable.videoId, input.videoId))
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
        .delete(commentTable)
        .where(
          and(
            eq(commentTable.userId, ctx.user.id),
            eq(commentTable.id, input.commentId)
          )
        )
        .returning({ id: commentTable.id });

      if (!deltedComment?.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
    }),
});
