import { trpc } from "@/__rpc/react";
import { CornerRightDown, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Comment } from "./comment";

interface CommentRepliesProps {
  parentId: string | null;
  videoId: string;
}

export const CommentReplies = ({ parentId, videoId }: CommentRepliesProps) => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.comments.get.useInfiniteQuery(
    {
      videoId,
      parentId,
    },
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );

  const replies = data?.pages.flatMap((page) => page.comments);
  return (
    <div className="pl-14">
      <div className="mt-2 flex flex-col gap-4">
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="mt-2 flex items-center justify-center">
            <p className="font-semibold text-destructive text-sm">
              {error.message}
            </p>
          </div>
        )}
        {!isLoading &&
          replies &&
          replies.map((comment) => (
            <Comment variant="reply" key={comment.id} comment={comment} />
          ))}
      </div>

      {hasNextPage && (
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          <CornerRightDown />
          Show more replies
        </Button>
      )}
    </div>
  );
};
