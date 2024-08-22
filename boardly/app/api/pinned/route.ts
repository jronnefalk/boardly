import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserInfo } from '@/lib/auth';

export async function POST(request: Request) {
  const { user } = await getUserInfo();
  const { workspaceId, boardId } = await request.json();

  if (!user || (!workspaceId && !boardId)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const existingPinnedItem = await prisma.pinnedItem.findFirst({
    where: {
      userId: user.id,
      workspaceId: workspaceId || undefined, 
      boardId: boardId || undefined, 
    },
  });

  if (existingPinnedItem) {
    return NextResponse.json({ error: 'Item already pinned' }, { status: 400 });
  }

  const maxPosition = await prisma.pinnedItem.aggregate({
    _max: { position: true },
    where: { userId: user.id },
  });

  const newPinnedItem = await prisma.pinnedItem.create({
    data: {
      userId: user.id,
      workspaceId,
      boardId,
      position: (maxPosition._max.position || 0) + 1,
    },
    include: {
      workspace: true,
      board: true,
    },
  });

  const formattedItem = {
    id: newPinnedItem.id,
    title: newPinnedItem.boardId ? newPinnedItem.board?.title : newPinnedItem.workspace?.name || "Untitled",
    type: newPinnedItem.boardId ? "board" : "workspace",
    workspaceName: newPinnedItem.workspace?.name,
    workspaceId: newPinnedItem.workspaceId || newPinnedItem.board?.workspaceId,
  };
  

  return NextResponse.json(formattedItem);
}

export async function GET() {
  const { user } = await getUserInfo();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pinnedItems = await prisma.pinnedItem.findMany({
    where: { userId: user.id },
    include: {
      workspace: true,
      board: true,
    },
    orderBy: { position: 'asc' },
  });

  const formattedItems = pinnedItems.map(item => ({
    id: item.id, 
    title: item.boardId ? item.board?.title : item.workspace?.name || "Untitled",
    type: item.boardId ? "board" : "workspace",
    workspaceName: item.workspace?.name,
    workspaceId: item.workspaceId || item.board?.workspaceId,
  }));

  return NextResponse.json({ pinnedItems: formattedItems });
}


