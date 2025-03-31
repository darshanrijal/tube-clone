import { HydrateClient, api } from "@/__rpc/server";
import { SuspenseFallbackError } from "@/components/suspense-fallback-error";
import { Loader2 } from "lucide-react";
import { VideoIdClientPage } from "./page.client";

export default async function VideoId({
  params,
}: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  api.studio.getVideo.prefetch({ videoId });
  api.categories.get.prefetch();
  return (
    <HydrateClient>
      <SuspenseFallbackError
        fallback={<Loader2 className="mx-auto size-7 animate-spin" />}
      >
        <div className="max-w-screen-xl px-4 pt-2.5">
          <VideoIdClientPage videoId={videoId} />
        </div>
      </SuspenseFallbackError>
    </HydrateClient>
  );
}
