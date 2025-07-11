import type { RouterOutputs } from "@/__rpc/react";

export type VideoData = RouterOutputs["videos"]["getVideo"];
export type CommentData = RouterOutputs["comments"]["get"]["comments"][number];
export type VideoGetManyOutput = RouterOutputs["suggestions"]["get"];

export type Fn<T, K> = (input: T) => K;

export type PlaylistData = RouterOutputs["playlists"]["getMany"]["playlists"];

export type UserData = RouterOutputs["users"]["get"];
