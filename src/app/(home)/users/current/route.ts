import { getUserByClerkId } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(userId);

  return redirect(`/users/${user.id}`);
}
