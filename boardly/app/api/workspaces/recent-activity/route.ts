import prisma from "@/lib/prisma";
import { getUserInfo } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const { isAuthenticated, user } = await getUserInfo();

  if (!isAuthenticated || !user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      workspaces: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const workspaceIds = dbUser.workspaces.map(uw => uw.workspaceId);

  const activities = await prisma.activity.findMany({
    where: {
      workspaceId: { in: workspaceIds },
    },
    include: {
      user: true,
      board: true,
      column: true,
      card: true,
      workspace: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5, 
  });

  console.log("Fetched activities:", activities);

  const activitiesWithNames = activities.map(activity => ({
    ...activity,
    workspaceName: activity.workspace?.name,
    boardName: activity.board?.title || null,
  }));

  return NextResponse.json({ activities: activitiesWithNames });
}
