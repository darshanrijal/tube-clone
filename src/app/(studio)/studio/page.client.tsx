"use client";

import { trpc } from "@/__rpc/react";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VideoThumbnail } from "@/components/video/video-thumbnail";
import { prettify } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Globe2, LockIcon, VideoIcon } from "lucide-react";
import Link from "next/link";

export const StudioClientPage = () => {
  const [data, query] = trpc.studio.getAllVideos.useSuspenseInfiniteQuery(
    {},
    {
      getNextPageParam: (lastpage) => lastpage.nextCursor,
    }
  );

  const videos = data.pages.flatMap((page) => page.videos);
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <div className="rounded-full bg-muted p-4">
          <VideoIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-xl">No videos yet</h3>
        <p className="max-w-md text-center text-muted-foreground">
          Upload your first video to get started. Your videos will appear here
          once they're processed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] pl-6">Video</TableHead>
              <TableHead className="hidden sm:table-cell">Visibility</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Views
              </TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Comments
              </TableHead>
              <TableHead className="pr-6 text-right">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow
                key={video.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <TableCell className="pl-6">
                  <Link href={`/studio/videos/${video.id}`} className="block">
                    <div className="flex items-center gap-4">
                      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md sm:w-36">
                        <VideoThumbnail
                          imageUrl={video.thumbnailUrl}
                          title={video.title}
                          previewUrl={video.previewUrl}
                          duration={video.duration}
                        />
                      </div>
                      <div className="flex flex-col gap-y-1 overflow-hidden">
                        <span className="max-w-45 truncate font-medium text-sm">
                          {video.title || "Untitled video"}
                        </span>
                        <span className="max-w-60 truncate text-muted-foreground text-xs">
                          {video.description || "No description"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center">
                    {video.visibility === "PRIVATE" ? (
                      <LockIcon className="mr-2 size-4 text-amber-500" />
                    ) : (
                      <Globe2 className="mr-2 size-4 text-green-500" />
                    )}
                    {prettify(video.visibility)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        video.muxStatus === "ready"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {prettify(video.muxStatus || "processing")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground text-sm md:table-cell">
                  {formatDate(video.createdAt, "MMM d, yyyy")}
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                  views
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                  comments
                </TableCell>
                <TableCell className="pr-6 text-right text-muted-foreground">
                  likes
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InfiniteScroll {...query} isManual />
    </div>
  );
};

export const VideoTableSkeleton = () => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px] pl-6">Video</TableHead>
              <TableHead className="hidden sm:table-cell">Visibility</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Views
              </TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Comments
              </TableHead>
              <TableHead className="pr-6 text-right">Likes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <div className="relative aspect-video w-24 shrink-0 animate-pulse overflow-hidden rounded-md bg-muted sm:w-36" />
                    <div className="flex flex-col gap-y-2 overflow-hidden">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center">
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="hidden text-right lg:table-cell">
                  <div className="ml-auto h-4 w-10 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="hidden text-right lg:table-cell">
                  <div className="ml-auto h-4 w-10 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <div className="ml-auto h-4 w-10 animate-pulse rounded bg-muted" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
