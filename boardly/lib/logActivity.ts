import prisma from "@/lib/prisma";
import { getUserInfo } from "@/lib/auth";

export async function logActivity(
  action: string,
  description: string,
  workspaceId: string, 
  boardId?: string,
  columnId?: string,
  cardId?: string
) {
  const { isAuthenticated, user } = await getUserInfo();

  if (!isAuthenticated || !user || !user.email) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  
  let workspaceName = workspace ? workspace.name : null;
  let correctBoardId = boardId || null;
  let boardName = null;

  if (!correctBoardId && columnId) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });
    if (column?.board) {
      correctBoardId = column.boardId;
      boardName = column.board.title;
    }
  } else if (!correctBoardId && cardId) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { column: { include: { board: true } } },
    });
    if (card?.column?.board) {
      correctBoardId = card.column.boardId;
      boardName = card.column.board.title;
    }
  } else if (correctBoardId) {
    const board = await prisma.board.findUnique({
      where: { id: correctBoardId },
    });
    if (board) {
      boardName = board.title;
    }
  }

  console.log(`Correct Board ID: ${correctBoardId}, Board Name: ${boardName}`);

  await prisma.activity.create({
    data: {
      action,
      description,
      userId: dbUser.id,
      workspaceId, 
      boardId: correctBoardId, 
      columnId,
      cardId,
    },
  });

  return { workspaceName, boardName }; 
}
