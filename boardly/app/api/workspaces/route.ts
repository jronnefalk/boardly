import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createWorkspaceServer } from '@/lib/workspace';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { workspaceName } = await request.json();
  try {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();
    const user = isAuthenticated ? await session.getUser() : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        createdBy: user.email,
        users: {
          create: {
            user: {
              connect: { email: user.email },
            },
          },
        },
      },
    });

    return NextResponse.json({ message: 'Workspace created successfully', workspace }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getKindeServerSession();
    const isAuthenticated = await session.isAuthenticated();
    const user = isAuthenticated ? await session.getUser() : null;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('id');

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.createdBy !== user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.userWorkspace.deleteMany({
      where: { workspaceId },
    });

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ message: 'Workspace deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
