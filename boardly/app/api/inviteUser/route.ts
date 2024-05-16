import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();
    const user = isAuthenticated ? await session.getUser() : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, email, role } = await request.json();
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { users: true },
    });

    if (!workspace || workspace.createdBy !== user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if the user is already part of the workspace
    const existingUserWorkspace = await prisma.userWorkspace.findFirst({
      where: {
        workspaceId,
        user: {
          email,
        },
      },
    });

    if (existingUserWorkspace) {
      return NextResponse.json({ error: 'User already part of the workspace' }, { status: 400 });
    }

    // Check if the user exists in MongoDB
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User does not exist in our system' }, { status: 400 });
    }

    // Add user to the workspace
    await prisma.userWorkspace.create({
      data: {
        user: {
          connect: { email },
        },
        workspace: {
          connect: { id: workspaceId },
        },
        role: role || 'VIEWER', // Default role if not provided
      },
    });

    return NextResponse.json({ message: 'User added to the workspace' }, { status: 200 });
  } catch (error: any) {
    console.error('Error inviting user to the workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
