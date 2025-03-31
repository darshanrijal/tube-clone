import { db } from "@/db";
import { userTable } from "@/db/schema";

export async function GET() {
  await db.insert(userTable).values({
    clerkId: "userId_",
    imageUrl: "imageurl",
    name: "Darshan rijal",
  });
  return Response.json({ message: "User created" });
}
