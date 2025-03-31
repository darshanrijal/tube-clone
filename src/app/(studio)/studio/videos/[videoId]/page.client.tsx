"use client";

import { getBaseUrl, trpc } from "@/__rpc/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ThumbnailUploadModal } from "@/components/video/thumbnail-upload-modal";
import { VideoPlayer } from "@/components/video/video-player";
import { prettify } from "@/lib/utils";
import { type UpdateVideoValues, updateVideoSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CopyCheck,
  CopyIcon,
  Globe2,
  ImagePlus,
  LockIcon,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface VideoIdClientPageProps {
  videoId: string;
}
export const VideoIdClientPage = ({ videoId }: VideoIdClientPageProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [video] = trpc.studio.getVideo.useSuspenseQuery({ videoId });
  const [categories] = trpc.categories.get.useSuspenseQuery();
  const utils = trpc.useUtils();
  const router = useRouter();
  const update = trpc.videos.update.useMutation({
    onError: (err) => toast.warning(err.message),
    onSuccess: () => {
      utils.studio.getVideo.invalidate({ videoId });
      utils.studio.getAllVideos.invalidate();
      toast.success("Video updated");
    },
  });
  const remove = trpc.videos.remove.useMutation({
    onError: (err) => toast.warning(err.message),
    onSuccess: () => {
      utils.studio.getAllVideos.invalidate();
      toast.success("Video deleted");
      router.push("/studio");
    },
  });
  const revalidate = trpc.videos.revalidate.useMutation({
    onError: (err) => toast.warning(err.message),
    onSuccess: () => {
      utils.studio.getAllVideos.invalidate();
      utils.studio.getVideo.invalidate({ videoId });
      toast.success("Video refreshed from server");
    },
  });
  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onError: (err) => toast.warning(err.message),
    onSuccess: () => {
      utils.studio.getVideo.invalidate({ videoId });
      utils.studio.getAllVideos.invalidate();
      toast.success("Video thumbnail restored");
    },
  });
  const form = useForm<UpdateVideoValues>({
    resolver: zodResolver(updateVideoSchema),
    defaultValues: {
      title: video.title,
      categoryId: video.categoryId ?? "",
      description: video.description ?? "",
      thumbnailUrl: video.thumbnailUrl ?? "",
      visibility: video.visibility,
    },
  });

  function onSubmit(data: UpdateVideoValues) {
    update.mutate({
      ...data,
      videoId,
      description: data.description ?? "",
      categoryId: data.categoryId ?? "",
    });
  }
  const fullUrl = `${getBaseUrl()}/videos/${video.id}`;
  function copy() {
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.info("Link copied");
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  }
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl">Video Details</h1>
              <p className="text-muted-foreground text-xs">
                Manage your video details
              </p>
            </div>

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => remove.mutate({ videoId })}>
                    <TrashIcon className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ videoId })}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Revalidate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add a title to your video"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add a description to your video"
                        value={field.value ?? ""}
                        rows={10}
                        maxLength={1200}
                        className="field-sizing-content max-h-60 resize-none pr-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="group relative h-21 w-[153px] border border-neutral-400 border-dashed p-0.5">
                        <Image
                          src={video.thumbnailUrl ?? "/placeholder.svg"}
                          fill
                          alt="Thumbnail"
                          className="object-cover"
                        />

                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="absolute top-1 right-1 size-7 rounded-full bg-black/50 opacity-100 hover:bg-black/50 group-hover:opacity-100 md:opacity-0"
                            >
                              <MoreVertical className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlus className="mr-1 size-4" />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ videoId })
                              }
                            >
                              <RotateCcw className="mr-1 size-4" />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a value" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex h-fit flex-col gap-4 overflow-hidden rounded-xl bg-[#f9f9f9]">
                <div className="relative aspect-video overflow-hidden">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    imageUrl={video.thumbnailUrl}
                  />
                </div>

                <div className="flex flex-col gap-y-6 p-4">
                  <div className="flex items-center justify-between gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="textxs text-muted-foreground">Video Link</p>
                      <div className="flex items-center gap-x-2">
                        <Link
                          href={`/videos/${video.id}`}
                          className="line-clamp-1 text-blue-500 text-sm"
                        >
                          <p>{fullUrl}</p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isCopied}
                          className="shrink-0"
                          onClick={copy}
                        >
                          {isCopied ? <CopyCheck /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video status
                      </p>
                      <p className="font-semibold text-sm">
                        {prettify(video.muxStatus)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Track status
                      </p>
                      <p className="font-semibold text-sm">
                        {prettify(video.muxTrackStatus ?? "no audio")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="PUBLIC">
                          <Globe2 className="mr-2 size-4 text-green-500" />
                          Public
                        </SelectItem>
                        <SelectItem value="PRIVATE">
                          <LockIcon className="mr-2 size-4 text-amber-500" />
                          Private
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>

      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
      />
    </>
  );
};
