import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const prisma = new PrismaClient();

export async function PATCH(request: Request) {
  try {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();
    const user = isAuthenticated ? await session.getUser() : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId, userId, role } = await request.json();
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { users: true },
    });

    if (!workspace || workspace.createdBy !== user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.userWorkspace.updateMany({
      where: {
        workspaceId,
        userId,
      },
      data: { role },
    });

    return NextResponse.json({ message: "User role updated" }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
