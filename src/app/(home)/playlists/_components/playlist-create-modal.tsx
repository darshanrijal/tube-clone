import type React from "react";

import { trpc } from "@/__rpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Fn } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

interface CreatePlaylistModalProps {
  open: boolean;
  onOpenChange: Fn<boolean, void>;
}

export function CreatePlaylistModal({
  onOpenChange,
  open,
}: CreatePlaylistModalProps) {
  const [name, setName] = useState("");
  const utils = trpc.useUtils();
  const create = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created successfully");
      utils.playlists.getMany.invalidate();
    },
    onError: (error) => toast.warning(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    create.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild className="sr-only">
        <Button variant="default">Create Playlist</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
          <DialogDescription>
            Enter a name for your new playlist.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="My Awesome Playlist"
                autoComplete="off"
              />
            </div>
            {create.error && (
              <p className="font-medium text-destructive text-sm">
                {create.error.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending ? "Creating..." : "Create Playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
