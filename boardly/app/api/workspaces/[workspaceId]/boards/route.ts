import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function POST(request: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const { title } = await request.json();
    const workspaceId = params.workspaceId;

    if (!title) {
      return NextResponse.json({ error: "Board title is required" }, { status: 400 });
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
        workspaceId,
      },
    });

    return NextResponse.json({ board: newBoard }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating board:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { workspaceId: string } }) {
  try {
    const workspaceId = params.workspaceId;

    const boards = await prisma.board.findMany({
      where: { workspaceId },
    });

    return NextResponse.json({ boards }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching boards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
      const { boardId } = await request.json();
  
      if (!boardId) {
        return NextResponse.json({ error: "Board ID is required" }, { status: 400 });
      }
  
      await prisma.board.delete({
        where: { id: boardId },
      });
  
      return NextResponse.json({ message: "Board deleted successfully" }, { status: 200 });
    } catch (error: any) {
      console.error("Error deleting board:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }