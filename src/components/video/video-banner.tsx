import { AlertTriangle } from "lucide-react";

interface VideoBannerProps {
  status: string;
}
export default function VideoBanner({ status }: VideoBannerProps) {
  if (status === "ready") {
    return null;
  }
  return (
    <div className="flex items-center gap-2 rounded-b-xl bg-yellow-500 px-4 py-3">
      <AlertTriangle className="line-clamp-1 size-4 shrink-0 font-medium text-black text-sm" />
      <p>This video is still being processed</p>
    </div>
  );
}
