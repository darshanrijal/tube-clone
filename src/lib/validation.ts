import { videoVisibilityEnum } from "@/db/schema";
import { z } from "zod";

export const updateVideoSchema = z.object({
  title: z.string().nonempty("Title must not be empty"),
  description: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || z.string().max(1200).safeParse(v).success),
  categoryId: z
    .string()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || z.string().cuid2().safeParse(v).success),
  thumbnailUrl: z.string().url().nullable(),
  visibility: z.enum(videoVisibilityEnum),
});
export type UpdateVideoValues = z.infer<typeof updateVideoSchema>;

export const createCommentSchema = z.object({
  comment: z
    .string()
    .trim()
    .nonempty("Write a comment!")
    .max(250, "Comment cannot be more than 250 characters"),
});
export type CreateCommentValues = z.infer<typeof createCommentSchema>;
