import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  await db.insert(users).values({
    clerkId: "userId_",
    imageUrl: "imageurl",
    name: "Darshan rijal",
  });
  return Response.json({ message: "User created" });
}
