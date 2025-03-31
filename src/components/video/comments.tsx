"use client";
import { trpc } from "@/__rpc/react";
import { CommentForm } from "../comments/comment-form";
import { InfiniteScroll } from "../infinite-scroll";
import { Comment } from "./comment";

interface CommentsProps {
  videoId: string;
}
export const Comments = ({ videoId }: CommentsProps) => {
  const [data, query] = trpc.comments.get.useSuspenseInfiniteQuery(
    { videoId },
    {
      getNextPageParam: (lp) => lp.nextCursor,
    }
  );

  const comments = data.pages.flatMap((page) => page.comments);
  const count = data.pages[0]?.totalCount;
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1 className="font-bold text-xl">{count} comments</h1>
        <CommentForm videoId={videoId} />
        <div className="mt-2 flex flex-col gap-4">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
          <InfiniteScroll isManual {...query} />
        </div>
      </div>
    </div>
  );
};
