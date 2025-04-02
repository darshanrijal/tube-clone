import { trpc } from "@/__rpc/react";
import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { useState } from "react";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  open,
  onOpenChange,
  userId,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();
  const [error, setError] = useState("");
  function onUploadComplete() {
    utils.users.get.invalidate({ userId });
    onOpenChange(false);
  }
  return (
    <ResponsiveModal
      title="Upload a thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      {error && (
        <p className="text-center font-semibold text-destructive text-sm">
          {error}
        </p>
      )}
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
        onUploadError={(e) => setError(e.message)}
      />
    </ResponsiveModal>
  );
};
