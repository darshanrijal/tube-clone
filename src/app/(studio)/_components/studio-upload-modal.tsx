"use client";
import { trpc } from "@/__rpc/react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";

export const StudioUploadModal = () => {
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      utils.studio.getAllVideos.invalidate();
      toast.success("Video created");
    },
    onError: (err) => toast.error(err.message),
  });
  const router = useRouter();
  function onSuccess() {
    if (create.status !== "success") {
      return;
    }
    toast.success("Video uploaded");
    router.push(`/studio/videos/${create.data.videoId}`);
  }

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={create.status === "success"}
        onOpenChange={create.reset}
      >
        <StudioUploader endpoint={create.data?.url} onSuccess={onSuccess} />
      </ResponsiveModal>
      <Button
        variant="secondary"
        onClick={() => create.mutate()}
        disabled={create.isPending}
      >
        {create.isPending ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <PlusIcon />
        )}
        {create.isPending ? "Creating..." : "Create"}
      </Button>
    </>
  );
};
