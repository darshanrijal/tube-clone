"use client";
import { getBaseUrl } from "@/__rpc/react";
import { ListPlus, MoreVertical, ShareIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PlaylistAddModal } from "./playlist-add-modal";

type VideoMenuProps = {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
};

export const VideoMenu = ({
  videoId,
  variant = "ghost",
  onRemove,
}: VideoMenuProps) => {
  const [openPlaylistAddModal, setOpenPlaylistAddModal] = useState(false);
  function onShare() {
    const fullUrl = `${getBaseUrl()}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.info("Link copied to clipboard");
    });
  }
  return (
    <>
      <PlaylistAddModal
        videoId={videoId}
        open={openPlaylistAddModal}
        onOpenChange={setOpenPlaylistAddModal}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size="icon" className="rounded-full">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="mr-2 size-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenPlaylistAddModal(true)}>
            <ListPlus className="mr-2 size-4" />
            Add to playlist
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem>
              <Trash2 className="mr-2 size-4" onClick={onRemove} />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
