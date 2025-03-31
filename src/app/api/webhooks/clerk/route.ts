import { db } from "@/db";
import { userTable } from "@/db/schema";
import { env } from "@/env";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const SIGNING_SECRET = env.CLERK_WEBHOOK_SECRET;

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response(`Error: Verification error, ${err}`, {
      status: 400,
    });
  }

  switch (evt.type) {
    case "user.created": {
      const data = evt.data;

      await db.insert(userTable).values({
        clerkId: data.id,
        imageUrl: data.image_url,
        name: `${data.first_name} ${data.last_name}`,
      });
      break;
    }

    case "user.updated": {
      const data = evt.data;
      await db
        .update(userTable)
        .set({
          imageUrl: data.image_url,
          name: `${data.first_name} ${data.last_name}`,
        })
        .where(eq(userTable.clerkId, data.id));
      break;
    }

    case "user.deleted": {
      const data = evt.data;

      if (!data.id) {
        return new Response("Error: Missing user id", { status: 400 });
      }
      await db.delete(userTable).where(eq(userTable.clerkId, data.id));
      break;
    }
    default:
      return new Response(`Unhandled event type: ${evt.type}`, {
        status: 400,
      });
  }

  return new Response("Webhook received", { status: 200 });
}
