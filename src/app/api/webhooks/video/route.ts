import { db } from "@/db";
import { videoTable } from "@/db/schema";
import { env } from "@/env";
import { mux } from "@/lib/mux";
import type {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

type WebhookEvent =
  | VideoAssetReadyWebhookEvent
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ill understand, its broken into cases
export async function POST(req: Request) {
  const headerPayload = await headers();
  const muxSignature = headerPayload.get("mux-signature");
  if (!muxSignature) {
    return new Response("No signature found", { status: 401 });
  }

  const payload: WebhookEvent = await req.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    env.MUX_WEBHOOK_SECRET
  );

  switch (payload.type) {
    case "video.asset.created": {
      const data = payload.data;

      if (!data.upload_id) {
        return new Response("No upload id", { status: 400 });
      }

      await db
        .update(videoTable)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status,
        })
        .where(eq(videoTable.muxUploadId, data.id));
      break;
    }

    case "video.asset.ready": {
      const data = payload.data;

      const playbackId = data.playback_ids?.[0]?.id;

      if (!playbackId) {
        return new Response("Missing playback id", { status: 400 });
      }

      if (!data.upload_id) {
        return new Response("Missing upload id", { status: 400 });
      }

      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const previewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

      const [thumbnailRes, previewRes] = await new UTApi().uploadFilesFromUrl([
        thumbnailUrl,
        previewUrl,
      ]);

      if (
        !thumbnailRes ||
        !previewRes ||
        thumbnailRes.error ||
        previewRes.error
      ) {
        return new Response("Failed to upload files", { status: 500 });
      }

      const duration = Math.round((data.duration ?? 0) * 1000);
      await db
        .update(videoTable)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          thumbnailUrl: thumbnailRes?.data.ufsUrl,
          thumbnailKey: thumbnailRes?.data.key,
          previewUrl: previewRes?.data.ufsUrl,
          previewKey: previewRes?.data.key,
          duration,
        })
        .where(eq(videoTable.muxUploadId, data.upload_id));

      break;
    }

    case "video.asset.errored": {
      const data = payload.data;

      if (!data.upload_id) {
        return new Response("Missing upload id", { status: 400 });
      }

      await db
        .update(videoTable)
        .set({ muxStatus: data.status })
        .where(eq(videoTable.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.deleted": {
      const data = payload.data;

      const [deletedVideo] = await db
        .delete(videoTable)
        .where(eq(videoTable.muxAssetId, data.id))
        .returning();

      if (!deletedVideo?.id) {
        return new Response("No video deleted");
      }

      const { thumbnailKey, previewKey } = deletedVideo;
      if (previewKey) {
        await new UTApi().deleteFiles([previewKey]);
      }

      if (thumbnailKey) {
        await new UTApi().deleteFiles([thumbnailKey]);
      }
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data as unknown as typeof payload.data & {
        asset_id: string;
      };

      const assetId = data.asset_id;
      const trackId = data.id;
      const status = data.status;

      await db
        .update(videoTable)
        .set({ muxTrackId: trackId, muxTrackStatus: status })
        .where(eq(videoTable.muxAssetId, assetId));

      break;
    }

    default:
      break;
  }

  return new Response("Webhook received");
}
