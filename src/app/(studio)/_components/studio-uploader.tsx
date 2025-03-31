import { Button } from "@/components/ui/button";
import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
  MuxUploaderStatus,
} from "@mux/mux-uploader-react";
import { UploadIcon } from "lucide-react";

interface StudioUploaderProps {
  endpoint: string | undefined;
  onSuccess: () => void;
}

export const StudioUploader = ({
  endpoint,
  onSuccess,
}: StudioUploaderProps) => {
  const muxUploader = "mux-uploader";
  return (
    <div>
      <MuxUploader
        id={muxUploader}
        endpoint={endpoint}
        onSuccess={onSuccess}
        className="group/uploader hidden"
      />

      <MuxUploaderDrop muxUploader={muxUploader} className="group/drop">
        <div slot="heading" className="flex flex-col items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center gap-2 rounded-full bg-muted">
            <UploadIcon className="size-10 text-muted-foreground transition-all duration-300 group/drop-[&[active]]:animate-bounce" />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm">Drag and drop files to upload</p>
            <p className="text-muted-foreground text-xs ">
              Your videos will be private until you publish them
            </p>
          </div>

          <MuxUploaderFileSelect muxUploader={muxUploader}>
            <Button type="button" className="rounded-full">
              Select files
            </Button>
          </MuxUploaderFileSelect>
        </div>
        <span slot="separator" className="hidden" />

        <MuxUploaderStatus muxUploader={muxUploader} className="text-sm" />
        <MuxUploaderProgress
          muxUploader={muxUploader}
          className="text-sm"
          type="percentage"
        />
        <MuxUploaderProgress muxUploader={muxUploader} type="bar" />
      </MuxUploaderDrop>
    </div>
  );
};
