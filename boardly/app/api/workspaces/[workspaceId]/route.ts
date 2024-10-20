import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getUserInfo } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { workspaceName } = await request.json();

    if (!workspaceName) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const { isAuthenticated, user } = await getUserInfo();

    if (!isAuthenticated || !user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        createdBy: dbUser.email,
        users: {
          create: {
            user: {
              connect: { id: dbUser.id },  // Make sure dbUser.id is an ObjectID
            },
            role: 'ADMIN',  // Optionally set a default role
          },
        },
      },
    });

    return NextResponse.json({ message: 'Workspace created successfully', workspace }, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { workspaceId: string } }) {
  try {
      const { workspaceId } = params;

      if (!workspaceId) {
          return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
      }

      // First, delete all related boards
      await prisma.board.deleteMany({
          where: { workspaceId },
      });

      // Then, delete all related UserWorkspace entries
      await prisma.userWorkspace.deleteMany({
          where: { workspaceId },
      });

      // Finally, delete the workspace
      await prisma.workspace.delete({
          where: { id: workspaceId },
      });

      return NextResponse.json({ message: 'Workspace and related boards deleted successfully' }, { status: 200 });
  } catch (error) {
      console.error('Error deleting workspace:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}