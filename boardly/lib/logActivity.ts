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

  if (!boardId && columnId) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });
    boardId = column?.boardId;
  } else if (!boardId && cardId) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { column: { include: { board: true } } },
    });
    boardId = card?.column.boardId;
  }

  await prisma.activity.create({
    data: {
      action,
      description,
      userId: dbUser.id,
      boardId,
      columnId,
      cardId,
      workspaceId, 
    },
  });
}
