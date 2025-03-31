import { getBaseUrl } from "@/__rpc/react";
import { ListPlus, MoreVertical, ShareIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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
  function onShare() {
    const fullUrl = `${getBaseUrl()}/videos/${videoId}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast.info("Link copied to clipboard");
    });
  }
  return (
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
        <DropdownMenuItem>
          <ListPlus className="mr-2 size-4" onClick={() => {}} />
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
  );
};
