import { trpc } from "@/__rpc/react";
import type { ReactionType } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { CommentData } from "@/types";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CommentForm } from "../comments/comment-form";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UserAvatar } from "../user-avatar";
import { CommentReplies } from "./comment-replies";

interface CommentProps {
  comment: CommentData;
  variant?: "reply" | "comment";
}

export const Comment = ({ comment, variant = "comment" }: CommentProps) => {
  const utils = trpc.useUtils();
  const clerk = useClerk();
  const { userId: clerkId } = useAuth();
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const remove = trpc.comments.remove.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      utils.comments.get.invalidate({ videoId: comment.videoId });
      toast.success("Comment deleted");
    },
  });
  const react = trpc.commentReactions.react.useMutation({
    onError: (err) => toast.warning(err.message),
    onSuccess: () => {
      utils.comments.get.invalidate({ videoId: comment.videoId });
    },
  });
  function handleReaction(type: ReactionType) {
    if (!clerk.isSignedIn) {
      clerk.openSignIn();
      return;
    }

    react.mutate({ commentId: comment.id, type });
  }
  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size={variant === "comment" ? "lg" : "sm"}
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/users/${comment.userId}`}>
            <div className="mb-0.5 flex items-center gap-2">
              <span className="pb-0.5 font-medium text-sm">
                {comment.user.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
          </Link>
          <p className="text-sm">{comment.comment}</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center">
              <Button
                size="icon"
                variant="ghost"
                disabled={react.isPending}
                className="size-8"
                onClick={() => handleReaction("like")}
              >
                <ThumbsUp
                  className={cn(
                    comment.viewerReaction === "like" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-muted-foreground text-xs">
                {comment.likeCount}
              </span>
              <Button
                size="icon"
                variant="ghost"
                disabled={react.isPending}
                className="size-8"
                onClick={() => handleReaction("dislike")}
              >
                <ThumbsDown
                  className={cn(
                    comment.viewerReaction === "dislike" && "fill-black"
                  )}
                />
              </Button>
              <span className="text-muted-foreground text-xs">
                {comment.dislikeCount}
              </span>
            </div>
            {variant === "comment" && (
              <Button
                onClick={() => setIsReplyOpen(true)}
                variant="ghost"
                size="sm"
                className="h-8 text-sm"
              >
                Reply
              </Button>
            )}
          </div>
        </div>
        {variant === "comment" && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                <MessageSquare className="size-4" />
                Reply
              </DropdownMenuItem>
              {comment.user.clerkId === clerkId && (
                <DropdownMenuItem
                  onClick={() => remove.mutate({ commentId: comment.id })}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentForm
            videoId={comment.videoId}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
            variant="reply"
            parentId={comment.id}
            onCancel={() => setIsReplyOpen(false)}
          />
        </div>
      )}

      {comment.replyCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button
            variant="tertiary"
            onClick={() => setIsRepliesOpen((c) => !c)}
          >
            {isRepliesOpen ? <ChevronUp /> : <ChevronDown />}
            {comment.replyCount} replies
          </Button>
        </div>
      )}

      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies parentId={comment.id} videoId={comment.videoId} />
      )}
    </div>
  );
};
