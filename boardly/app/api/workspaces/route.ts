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
              connect: { id: dbUser.id },
            },
            role: 'ADMIN',
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

export async function GET(request: Request) {
  try {
    const workspaces = await prisma.workspace.findMany();
    return NextResponse.json({ workspaces }, { status: 200 });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
