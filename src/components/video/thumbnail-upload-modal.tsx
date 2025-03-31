import { trpc } from "@/__rpc/react";
import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from "../responsive-modal";

interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) => {
  const utils = trpc.useUtils();

  function onUploadComplete() {
    utils.studio.getVideo.invalidate({ videoId });
    utils.studio.invalidate();
    onOpenChange(false);
  }
  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="thumbnailUploder"
        input={{
          videoId,
        }}
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  );
};
