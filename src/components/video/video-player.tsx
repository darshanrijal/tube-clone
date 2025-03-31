import MuxPlayer, {} from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string | null;
  imageUrl: string | null;
  autoPlay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video rounded-xl bg-black" />;
};

export const VideoPlayer = ({
  imageUrl,
  playbackId,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  if (!playbackId) {
    return null;
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={imageUrl ?? "/placeholder.svg"}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className="h-full w-full object-contain"
      accentColor="#ff2056"
      onPlay={onPlay}
    />
  );
};
